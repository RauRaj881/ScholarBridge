import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Application from "../models/Application.js";
import Activity from "../models/Activity.js";
import Scholarship from "../models/Scholarship.js";
import { buildVisibleScholarshipQuery } from "../utils/scholarshipVisibility.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOAD CONFIG — application documents
// ─────────────────────────────────────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), "uploads", "applications");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF or image files are accepted"));
  },
});

const logActivity = async (userId, action, details) => {
  try {
    if (!userId) return;
    await Activity.create({ userId, action, details });
  } catch (err) {
    console.error("❌ Activity trace writing failure:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPRESS CONTROLLER ROUTING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/scholarships
 * @desc    FEATURE 4: Fetch active, live scholarships, including legacy database records
 */
router.get("/", async (req, res) => {
  try {
    const activeCatalog = await Scholarship.find(buildVisibleScholarshipQuery())
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      scholarships: activeCatalog,
    });
  } catch (error) {
    console.error("❌ Student Catalog Error:", error.message);
    return res.status(500).json({
      success: false,
      scholarships: [],
      message: "Failed to balance active dashboard items",
    });
  }
});

/**
 * @route   POST /api/scholarships/eligibility
 * @desc    Execute index-optimized matching checks across data arrays for the Eligibility component
 */
router.post("/eligibility", async (req, res) => {
  try {
    const { state, category, course, income, userId } = req.body;
    const filterQuery = {};

    if (state) {
      filterQuery["eligibility.states"] = { $in: [state, "All", "all"] };
    }
    if (category) {
      filterQuery["eligibility.categories"] = { $in: [category, "All", "all"] };
    }
    if (course) {
      filterQuery["eligibility.courses"] = { $in: [course, "All", "all"] };
    }
    if (income) {
      filterQuery["eligibility.incomeLimit"] = { $gte: Number(income) };
    }

    const filteredRecords = await Scholarship.find(
      buildVisibleScholarshipQuery(filterQuery),
    )
      .sort({ featured: -1 })
      .lean();

    if (userId) {
      await logActivity(
        userId,
        "Checked Eligibility",
        `Criteria: State [${state || "Any"}], Course [${course || "Any"}], Income Boundary [₹${income || "Any"}]`,
      );
    }

    return res.json({
      success: true,
      count: filteredRecords.length,
      scholarships: filteredRecords,
    });
  } catch (error) {
    console.error(
      "❌ Eligibility Filter Exception [POST /eligibility]:",
      error.message,
    );
    return res
      .status(500)
      .json({ success: false, message: "Database filtering exception" });
  }
});

/**
 * @route   POST /api/scholarships/:id/apply
 * @desc    Authenticated student submits an application with a supporting document
 *          for a specific scholarship. Replaces the old unauthenticated JSON-only /apply route.
 */
router.post("/:id/apply", requireAuth, (req, res) => {
  upload.single("documents")(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res
        .status(400)
        .json({
          success: false,
          message: uploadErr.message || "File upload failed",
        });
    }

    try {
      const scholarshipId = req.params.id;
      const userId = req.user._id;

      const scholarship = await Scholarship.findById(scholarshipId)
        .select("title status")
        .lean();
      if (!scholarship) {
        return res
          .status(404)
          .json({ success: false, message: "Scholarship not found" });
      }
      if (scholarship.status === "expired") {
        return res
          .status(400)
          .json({
            success: false,
            message: "This scholarship is no longer accepting applications.",
          });
      }

      const existingApplication = await Application.findOne({
        userId,
        scholarshipId,
      });
      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message:
            "You have already submitted an active application tracker for this scholarship scheme.",
        });
      }

      const documents = [];
      if (req.file) {
        documents.push({
          originalName: req.file.originalname,
          fileName: req.file.filename,
          path: `/uploads/applications/${req.file.filename}`,
          size: req.file.size,
          mimeType: req.file.mimetype,
        });
      }

      const newApplication = new Application({
        userId,
        scholarshipId,
        status: "submitted",
        nextAction: "Awaiting administrative credentials assessment",
        documents,
      });

      await newApplication.save();

      await logActivity(
        userId,
        "Submitted Application",
        `Applied for Scheme: ${scholarship.title}`,
      );

      return res.json({
        success: true,
        message: "Application workflow established and tracked successfully",
        application: newApplication,
      });
    } catch (error) {
      console.error(
        "❌ Application Submission Tracking Error [POST /:id/apply]:",
        error.message,
      );
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to process target tracking intent",
        });
    }
  });
});

/**
 * @route   GET /api/scholarships/applications/:userId
 * @desc    Fetch all active historical tracker states for an individual logged-in student
 */
router.get("/applications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const trackingHistory = await Application.find({ userId })
      .populate("scholarshipId", "title provider amount deadline status")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      applications: trackingHistory,
    });
  } catch (error) {
    console.error(
      "❌ Workflow Application Retrieval Error [GET /applications/:userId]:",
      error.message,
    );
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to collect dashboard workflow instances",
      });
  }
});

/**
 * @route   GET /api/scholarships/:id
 * @desc    Fetch a single scholarship's full details for the dedicated detail page
 */
router.get("/:id", async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).lean();
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }
    return res.json({ success: true, scholarship });
  } catch (error) {
    console.error("❌ Scholarship Detail Fetch Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch scholarship details" });
  }
});

export default router;
