// src/ListView.jsx
import React, { useState, useEffect } from 'react';

const ListView = ({ appointments, onEdit, onDelete, patients, doctors, filter, setFilter }) => {
  const [flatList, setFlatList] = useState([]);

  useEffect(() => {
    const list = [];
    Object.entries(appointments).forEach(([date, appts]) => {
      appts.forEach((appt, index) => {
        list.push({ date, ...appt, index });
      });
    });
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFlatList(list);
  }, [appointments]);

  const filtered = flatList.filter(appt => {
    const matchPatient = filter.patient ? appt.patient === filter.patient : true;
    const matchDoctor = filter.doctor ? appt.doctor === filter.doctor : true;
    return matchPatient && matchDoctor;
  });

  return (
    <div className="list-view fade-in">
      <h2>All Appointments</h2>
      <div className="filters">
        <select value={filter.patient} onChange={e => setFilter({ ...filter, patient: e.target.value })}>
          <option value="">All Patients</option>
          {patients.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>
        <select value={filter.doctor} onChange={e => setFilter({ ...filter, doctor: e.target.value })}>
          <option value="">All Doctors</option>
          {doctors.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}

        </select>
      </div>
      <table className="appt-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((appt, i) => (
            <tr key={i}>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>{appt.patient}</td>
              <td>{appt.doctor}</td>
              <td>
                <button onClick={() => onEdit(appt.date, appt.index)}>✏️</button>
                <button onClick={() => onDelete(appt.date, appt.index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListView;
