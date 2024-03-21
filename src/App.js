import './App.css';
import React, { useState, useEffect } from 'react';
import searchImg from './assets/search.png'
import editImg from './assets/edit.png'
import saveImg from './assets/save.png'
import addImg from './assets/add.png'
import cancelImg from './assets/cancel.png'
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [holidays, setHolidays] = useState({});
  const [editingTask, setEditingTask] = useState({ day: null, index: null });
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    getHolidays();
  }, []);

  const getHolidays = async () => {
    try {
      const response = await axios.get('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide');
      if (response.status === 200) {
        const holidaysObj = {};
        response.data.forEach(holiday => {
          const date = holiday.date;
          if (!holidaysObj[date]) {
            holidaysObj[date] = [holiday.name];
          } else {
            holidaysObj[date].push(holiday.name);
          }
        });
        setHolidays(holidaysObj);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const handleTaskChange = (day, index, e) => {
    const newTasks = { ...tasks };
    newTasks[day][index].task = e.target.value;
    setTasks(newTasks);
  };

  const handleDragStart = (e, day, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, index }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInternalDrop = (e, targetDay, targetIndex) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { day: sourceDay, index: sourceIndex } = sourceData;

      const newTasks = { ...tasks };
      const sourceTask = newTasks[sourceDay][sourceIndex];


      newTasks[sourceDay].splice(sourceIndex, 1);


      newTasks[targetDay].splice(targetIndex, 0, sourceTask);


      setTasks(newTasks);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDayDrop = (e, targetDay) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { day: sourceDay, index: sourceIndex } = sourceData;

      const newTasks = { ...tasks };


      if (!newTasks[targetDay]) {
        newTasks[targetDay] = [];
      }

      const sourceTask = newTasks[sourceDay][sourceIndex];


      newTasks[sourceDay].splice(sourceIndex, 1);


      newTasks[targetDay].push(sourceTask);

      setTasks(newTasks);
    } catch (error) {
      console.log(error);
    }
  };


  const getDateForDay = (day) => {
    const today = new Date();
    today.setDate(day + 1);
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let date = today.getDate();
    date = date < 10 ? '0' + date : date;
    return `${year}-${month}-${date}`;
  };

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setDate(day);
    return days[today.getDay()];
  };

  const handleAddTask = (day) => {
    setSearchTerm('')
    setIsAddingTask(true);
    setEditingTask({ day, index: tasks[day]?.length || 0 });
  };

  const handleSaveTask = (e) => {
    e.stopPropagation()
    setSearchTerm('')
    setIsAddingTask(false);
    setEditingTask({ day: null, index: null });
    const newTasks = { ...tasks };
    if (!newTasks[editingTask.day]) newTasks[editingTask.day] = [];
    newTasks[editingTask.day][editingTask.index] = { task: newTaskText, date: getDateForDay(editingTask.day) };
    setTasks(newTasks);
    setNewTaskText('');
  };

  const handleEditTask = (day, index, taskText) => {
    setEditingTask({ day, index });
    setNewTaskText(taskText);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    setIsAddingTask(false);
    setEditingTask({ day: null, index: null });
    setNewTaskText('');
  };


  const [filteredTasks, setFilteredTasks] = useState({});


  useEffect(() => {
    const filtered = {};
    Object.keys(tasks).forEach(day => {
      filtered[day] = tasks[day].filter(task => task.task.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    setFilteredTasks(filtered);
  }, [searchTerm, tasks]);


  const getDayOfWeek = (date) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  };

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const getMonthName = (monthNumber) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1];
  };
  const calculateTaskCount = (day) => {
    return filteredTasks[day] ? filteredTasks[day].length : 0;
  };

  return (
    <div className="calendar">
      <div className='top-bar'>
        <div className='searching'>
          <img src={searchImg} alt='' />
          <input
            type="text"
            placeholder="Search tasks"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span>MARCH 2018</span>
        <div className='top-btns'>
        <button>Today</button>
          <button>Week</button>
          <button>Month</button>
          
        </div>
      </div>


      <div className="calendar-grid">
        {[...Array(7).keys()].map(day => (
          <div key={day} className="calendar-cell-day">{getDayName((day + 3) % 7)}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {/* Render empty placeholders for the days before the first day of the month */}
        {[...Array(getDayOfWeek(new Date(year, month - 1, 1))).keys()].map((day, index) => (
          <div key={`empty-${index}`} className="calendar-cell" style={{cursor:'context-menu'}}></div>
        ))}

        {[...Array(31).keys()].map(day => (
          <div
            key={day}
            className="calendar-cell"
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDayDrop(e, day)}
            onClick={() => handleAddTask(day)}
          >
            <div className="day-number">
              {getMonthName(month)} {day + 1}<span className='cards'> {calculateTaskCount(day) > 0 ? `${calculateTaskCount(day)} cards` : ''}</span>
            </div>


            {filteredTasks[day] &&
              filteredTasks[day].map((task, index) => (
                <div
                  key={index}
                  className="task"
                  draggable
                  onDrop={(e) => handleInternalDrop(e, day, index)}
                  onDragStart={(e) => handleDragStart(e, day, index)}
                >
                  {editingTask.day === day && editingTask.index === index ? (
                    <div className='task-name'>
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                      />
                      <div className='saveandcancel'>
                        <button onClick={(e) => handleSaveTask(e)} className='save' ><img src={saveImg} alt='' className='save-btn' />Save</button>
                        <button onClick={(e) => handleCancelEdit(e)} className='cancel' ><img src={cancelImg} alt='' className='cancel-btn' />Cancel</button>
                      </div>

                    </div>
                  ) : (
                    <div onClick={() => handleEditTask(day, index, task?.task)} className='task-name'>
                      <div className='task-design'></div>
                      <span >{task?.task}</span>
                    </div>
                  )}
                </div>
              ))}
            {isAddingTask && editingTask.day === day && (
              <div>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <div className='saveandcancel'>
                  <button onClick={(e) => handleSaveTask(e)} className='save' style={{ color: 'green' }}><img src={saveImg} alt='' className='save-btn' />Save</button>
                  <button onClick={(e) => handleCancelEdit(e)} className='save' style={{ color: 'red' }}><img src={cancelImg} alt='' className='cancel-btn' />Cancel</button>
                </div>
              </div>
            )}
            {/* {!isAddingTask && (
              <button  className='add-btn'><img src={addImg} alt='' className='save-btn' />Add Task</button>
            )} */}
            {/* <ul>
              {holidays[getDateForDay(day)] && <li>{holidays[getDateForDay(day)]}</li>}
            </ul> */}
            <div className='holiday-div'>
              {Array.isArray(holidays[getDateForDay(day)]) &&
                holidays[getDateForDay(day)].map((holiday, index) => (
                  <span key={index} className='holiday-span'>{holiday}</span>
                ))}
            </div>


          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
