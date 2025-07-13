import React, { useState, useEffect } from 'react';
import './App.css';
import './animations.css';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({ patient: '', doctor: '', time: '' });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState({ doctor: '', patient: '' });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    fetch('/data/patients.json').then(res => res.json()).then(setPatients);
    fetch('/data/doctors.json').then(res => res.json()).then(setDoctors);
  }, []);

  const hardcodedUser = {
    email: 'staff@clinic.com',
    password: '123456'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === hardcodedUser.email && password === hardcodedUser.password) {
      setLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const dateKey = selectedDate.toDateString();
    const newAppt = { ...formData };
    const updated = {
      ...appointments,
      [dateKey]: [...(appointments[dateKey] || []), newAppt]
    };
    setAppointments(updated);
    setFormVisible(false);
    setFormData({ patient: '', doctor: '', time: '' });
  };

  const deleteAppointment = (dateKey, index) => {
    const updated = { ...appointments };
    updated[dateKey].splice(index, 1);
    if (updated[dateKey].length === 0) delete updated[dateKey];
    setAppointments(updated);
  };

  const filteredAppointments = (appts) => {
    return appts.filter(appt => {
      const matchPatient = filter.patient ? appt.patient === filter.patient : true;
      const matchDoctor = filter.doctor ? appt.doctor === filter.doctor : true;
      return matchPatient && matchDoctor;
    });
  };

  const renderMobileScrollView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayList = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      const dateKey = thisDate.toDateString();
      const appts = filteredAppointments(appointments[dateKey] || []);
      dayList.push(
        <div className="mobile-day-block fade-up" key={day}>
          <h3>{thisDate.toDateString()}</h3>
          <ul>
            {appts.map((appt, i) => (
              <li key={i} className="pop-in">
                {appt.time} - {appt.patient} ({appt.doctor})
                <button onClick={() => deleteAppointment(dateKey, i)}>🗑️</button>
              </li>
            ))}
          </ul>
          <button onClick={() => {
            setSelectedDate(thisDate);
            setFormVisible(true);
          }}>Add Appointment</button>
        </div>
      );
    }

    return (
      <div className="mobile-scroll-container">
        <input type="month" value={`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`} onChange={(e) => {
          const [year, month] = e.target.value.split('-');
          setSelectedDate(new Date(year, month - 1, 1));
        }} />
        <div className="scroll-view">
          {dayList}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div className="day empty" key={`empty-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      const dateKey = thisDate.toDateString();
      const appts = filteredAppointments(appointments[dateKey] || []);
      calendarDays.push(
        <div
          key={day}
          className="day zoom-hover fade-in"
          onClick={() => {
            setSelectedDate(thisDate);
            setFormVisible(true);
          }}
        >
          <strong>{day}</strong>
          <div className="appts">
            {appts.map((appt, i) => (
              <div key={i}>
                {appt.time} - {appt.patient}
                <button onClick={(e) => { e.stopPropagation(); deleteAppointment(dateKey, i); }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="calendar-grid">{calendarDays}</div>;
  };

  if (!loggedIn) {
    return (
      <div className={`login-container ${darkMode ? 'dark' : ''}`} style={{ backgroundImage: 'url("/assets/hospital.jpg")' }}>
        <div className="login-box fade-in">
          <img src="/assets/logo.png" alt="CuraClinic" className="logo" />
          <h2>CuraClinic Login</h2>
          <form onSubmit={handleLogin} className="slide-in">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="glow">Login</button>
          </form>
        </div>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="top-bar">
        <img src="/assets/logo.png" alt="CuraClinic" className="logo-sm" />
        <h2>CuraClinic Appointment Calendar</h2>
      </header>
      <div className="filters">
        <select value={filter.patient} onChange={(e) => setFilter({ ...filter, patient: e.target.value })}>
          <option value="">All Patients</option>
          {patients.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>
        <select value={filter.doctor} onChange={(e) => setFilter({ ...filter, doctor: e.target.value })}>
          <option value="">All Doctors</option>
          {doctors.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">{darkMode ? '☀️' : '🌙'}</button>
      </div>
      {isMobile ? renderMobileScrollView() : renderCalendar()}
      {formVisible && (
        <div className="modal slide-up">
          <h3>Add Appointment for {selectedDate.toDateString()}</h3>
          <form onSubmit={handleAddAppointment}>
            <label>Patient:
              <select value={formData.patient} onChange={(e) => setFormData({ ...formData, patient: e.target.value })} required>
                <option value="">Select</option>
                {patients.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </label>
            <label>Doctor:
              <select value={formData.doctor} onChange={(e) => setFormData({ ...formData, doctor: e.target.value })} required>
                <option value="">Select</option>
                {doctors.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </label>
            <label>Time:
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </label>
            <button type="submit" className="glow">Save</button>
            <button type="button" onClick={() => setFormVisible(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
