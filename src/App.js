import React, { useState, useEffect } from 'react';
import './App.css';
import './animations.css';
import ListView from './ListView';

const App = () => {
  const [loading, setLoading] = useState(true);
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
const [doctors, setDoctors] = useState(() => {
  const saved = localStorage.getItem('doctors');
  return saved ? JSON.parse(saved) : [];
});

const [newPatientName, setNewPatientName] = useState('');
const [newDoctorNameSimple, setNewDoctorNameSimple] = useState('');


const [newDoctorName, setNewDoctorName] = useState('');
const [newDoctorImage, setNewDoctorImage] = useState(null); // image file

  const [filter, setFilter] = useState({ doctor: '', patient: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('calendar');
  const [editInfo, setEditInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
 

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/data/patients.json').then(res => res.json()).then(setPatients);
    fetch('/data/doctors.json').then(res => res.json()).then(data => {
  if (Array.isArray(data)) {
    setDoctors(data.map(name => ({ name, image: null })));
  }
});

    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader"></div>
        <p>Loading CuraClinic...</p>
      </div>
    );
  }

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
    const updated = { ...appointments };
    if (editInfo) {
      updated[editInfo.date][editInfo.index] = newAppt;
    } else {
      updated[dateKey] = [...(appointments[dateKey] || []), newAppt];
    }
    setAppointments(updated);
    setFormVisible(false);
    setFormData({ patient: '', doctor: '', time: '' });
    setEditInfo(null);
  };

  const deleteAppointment = (dateKey, index) => {
    const updated = { ...appointments };
    updated[dateKey].splice(index, 1);
    if (updated[dateKey].length === 0) delete updated[dateKey];
    setAppointments(updated);
  };

  const editAppointment = (dateKey, index) => {
    const appt = appointments[dateKey][index];
    setFormData(appt);
    setSelectedDate(new Date(dateKey));
    setEditInfo({ date: dateKey, index });
    setFormVisible(true);
  };

  const filteredAppointments = (appts) => {
    return appts.filter(appt => {
      const matchPatient = filter.patient ? appt.patient === filter.patient : true;
      const matchDoctor = filter.doctor ? appt.doctor === filter.doctor : true;
      return matchPatient && matchDoctor;
    });
  };

const getDateKey = (date) => date.toISOString().split('T')[0]; // "2025-07-13"
const todayKey = getDateKey(new Date());


  const renderCalendar = () => {
    if (isMobile) {
      const dateKey = selectedDate.toDateString();
      const appts = filteredAppointments(appointments[dateKey] || []);
      const isToday = dateKey === todayKey;
      return (
        <div className="mobile-scroll-container">
          <input type="date" className="date-picker" value={selectedDate.toISOString().split('T')[0]} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
          <div className={`mobile-day-block fade-in ${isToday ? 'today' : ''}`}>
            <h4>{dateKey}</h4>
            {appts.length === 0 && <p>No appointments</p>}
            {appts.map((appt, i) => (
              <div key={i}>
                ⏰ {appt.time} – 👤 {appt.patient} – 🧑‍⚕️ {appt.doctor}
                <button onClick={() => editAppointment(dateKey, i)}>✏️</button>
                <button onClick={() => deleteAppointment(dateKey, i)}>🗑️</button>
              </div>
            ))}
            <button onClick={() => setFormVisible(true)}>➕ Add Appointment</button>
          </div>
        </div>
      );
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div className="day grey" key={`grey-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      const dateKey = getDateKey(thisDate);
      const appts = filteredAppointments(appointments[dateKey] || []);
      const isToday = dateKey === todayKey;

      calendarDays.push(
        <div
          key={day}
          className={`day zoom-hover fade-in ${isToday ? 'today' : ''}`}
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

    return (
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>◀️</button>
          <h3>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>▶️</button>
        </div>
        <div className="day-names">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => <div key={i} className="day-name">{d}</div>)}
        </div>
        <div className="calendar-grid">{calendarDays}</div>
      </div>
    );
  };

  if (!loggedIn) {
    return (
      <div className={`login-container ${darkMode ? 'dark' : ''}`}>
        <div className="half-bg left" style={{ backgroundImage: `url('/assets/img1.jpg')` }}></div>
        <div className="half-bg right" style={{ backgroundImage: `url('/assets/img2.jpg')` }}></div>

        <div className="left-overlay-box">
          <div className="carousel">
            <img src={`/assets/ro${carouselIndex + 1}.jpg`} alt={`Medicine ${carouselIndex + 1}`} />
          </div>
        </div>

        <div className="right-overlay-box">
          <div className="doctor-carousel">
            <img src={`/assets/doc${carouselIndex + 1}.jpg`} alt={`Doctor ${carouselIndex + 1}`} />
<p className="doc-title">
  {doctors[carouselIndex]?.name || `Doctor ${carouselIndex + 1}`}
</p>
          </div>
        </div>

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

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="top-bar">
        <img src="/assets/logo.png" alt="CuraClinic" className="logo-sm" />
        <h2>CuraClinic Appointment Calendar</h2>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️' : '🌙'}</button>
      </header>

      <div className="view-toggle">
        <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'active' : ''}>📅 Calendar View</button>
        <button onClick={() => setView('list')} className={view === 'list' ? 'active' : ''}>📋 List View</button>
        <button onClick={() => setView('doctors')} className={view === 'doctors' ? 'active' : ''}>🧑‍⚕️ Doctors</button>
      </div>

      {view === 'calendar' && (
  <div className="add-new-section fade-in">
    <div className="input-box">
      <input
        type="text"
        placeholder="Add new patient"
        value={newPatientName}
        onChange={(e) => setNewPatientName(e.target.value)}
      />
      <button
        onClick={() => {
          const trimmed = newPatientName.trim();
          if (trimmed && !patients.includes(trimmed)) {
            setPatients([...patients, trimmed]);
            setNewPatientName('');
          }
        }}
      >
        ➕ Add Patient
      </button>
    </div>

    <div className="input-box">
      <input
        type="text"
        placeholder="Add new doctor"
        value={newDoctorNameSimple}
        onChange={(e) => setNewDoctorNameSimple(e.target.value)}
      />
      <button
        onClick={() => {
          const trimmed = newDoctorNameSimple.trim();
          if (trimmed && !doctors.some(doc => doc.name === trimmed)) {
            setDoctors([...doctors, { name: trimmed, image: null }]);
            setNewDoctorNameSimple('');
          }
        }}
      >
        ➕ Add Doctor
      </button>
    </div>
  </div>
)}


      {view === 'calendar' && renderCalendar()}

      {view === 'list' && (
        <ListView
          appointments={appointments}
          onDelete={deleteAppointment}
          onEdit={editAppointment}
          patients={patients}
          doctors={doctors}
          filter={filter}
          setFilter={setFilter}
        />
      )}

      {view === 'doctors' && (
        <div className="doctors-grid">
          {doctors.map((doc, i) => (
  <div className="doctor-card" key={i}>
    <img src={doc.image || `/assets/doc${(i % 5) + 1}.jpg`} alt={doc.name} />
    <div className="doctor-name" style={{ color: darkMode ? '#fff' : '#000' }}>{doc.name}</div>
    <button onClick={() => setDoctors(doctors.filter((_, index) => index !== i))}>Delete</button>
  </div>
))}

         <div className="doctor-card add-card">
  <input
    value={newDoctorName}
    onChange={(e) => setNewDoctorName(e.target.value)}
    placeholder="New doctor name"
  />
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setNewDoctorImage(URL.createObjectURL(e.target.files[0]))}
  />
  <button
    onClick={() => {
      if (newDoctorName.trim() && newDoctorImage) {
        setDoctors([...doctors, { name: newDoctorName.trim(), image: newDoctorImage }]);
        setNewDoctorName('');
        setNewDoctorImage(null);
      }
    }}
  >
    ➕ Add Doctor
  </button>
</div>

        </div>
      )}

      {formVisible && (
        <div className="modal slide-up">
          <h3>{editInfo ? 'Edit Appointment' : `Add Appointment for ${selectedDate.toDateString()}`}</h3>
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
                {doctors.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}

              </select>
            </label>
            <label>Time:
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </label>
            <button type="submit" className="glow">{editInfo ? 'Update' : 'Save'}</button>
            <button type="button" onClick={() => { setFormVisible(false); setEditInfo(null); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
