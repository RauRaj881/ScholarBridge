import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManageScholarships() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get('/api/student/available-scholarships')
      .then(res => setList(res.data.scholarships))
      .catch(err => console.error(err));
  }, []);

  async function handleExpire(id) {
    if (!window.confirm("Mark this scheme as expired?")) return;
    const res = await axios.patch(`/api/admin/scholarships/${id}/expire`);
    if (res.data.success) {
      setList(list.filter(item => item._id !== id)); // Instantly updates local layout state
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this scheme?")) return;
    const res = await axios.delete(`/api/admin/scholarships/${id}`);
    if (res.data.success) {
      setList(list.filter(item => item._id !== id));
    }
  }

  return (
    <div style={{ padding: '20px', color: '#fff', background: '#1e1e2e', borderRadius: '12px' }}>
      <h3>Active System Catalog Management</h3>
      <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
        {list.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#11111b', borderRadius: '8px' }}>
            <div>
              <strong>{item.title}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#a6adc8' }}>Provided by: {item.provider}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => handleExpire(item._id)} style={{ padding: '6px 12px', background: '#fab387', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#111' }}>Mark Expired</button>
              <button onClick={() => handleDelete(item._id)} style={{ padding: '6px 12px', background: '#f38ba8', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#111' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}