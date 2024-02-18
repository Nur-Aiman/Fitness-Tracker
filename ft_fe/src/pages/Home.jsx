import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOST } from '../api'

const generateDateRange = (startDate, endDate) => {
    const dateRange = [];
    let currentDate = new Date(startDate);

    // Ensure currentDate is set to the start of the day in local time
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      // Use local date string to avoid time zone conversion issues
      dateRange.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
};


const Home = () => {
    const navigate = useNavigate();
    const [exerciseLogs, setExerciseLogs] = useState([]);
    const [exerciseList, setExerciseList] = useState([]);
    const [checkedExercises, setCheckedExercises] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseDetails, setExerciseDetails] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editableExercise, setEditableExercise] = useState({ name: '', id: null });
    const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [currentStartDate, setCurrentStartDate] = useState(new Date());
    const [allDatesInRange, setAllDatesInRange] = useState([]);

    function getLocalDateForKualaLumpur() {
        // Get the current UTC date and time
        const now = new Date();
        // Convert to UTC (+0)
        const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        // Kuala Lumpur is UTC+8, so add 8 hours to UTC time
        const klTime = new Date(utc + (3600000 * 8));
        // Format to YYYY-MM-DD
        const klDate = klTime.toISOString().split('T')[0];
        return klDate;
    }
    
    
    


    const openNewExerciseModal = () => {
        setIsNewExerciseModalOpen(true);
    };

    const closeNewExerciseModal = () => {
        setIsNewExerciseModalOpen(false);
        setNewExerciseName('');
    };
    
    const handleNewExerciseNameChange = (e) => {
        setNewExerciseName(e.target.value);
    };
    
    const handleSaveNewExercise = async () => {
        try {
            const response = await fetch(`${HOST}/exercise/addExercise`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newExerciseName }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data); 
    
            alert("New exercise added successfully!");
            await fetchExerciseList();
            setIsNewExerciseModalOpen(false);
            setNewExerciseName('');
        } catch (error) {
            console.error('Error adding new exercise:', error);
        }
    };
    


    const openEditModal = (exercise) => {
        setEditableExercise(exercise);
        setIsEditModalOpen(true);
      };
      

      const handleNameChange = (e) => {
        setEditableExercise({ ...editableExercise, name: e.target.value });
      };


    useEffect(() => {
        const fetchExerciseLogs = async () => {
            try {
                const response = await fetch(`${HOST}/exercise/viewExerciseLog`); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setExerciseLogs(data);
            } catch (error) {
                console.error("Error fetching exercise logs: ", error);
            }
        };

        const fetchExerciseList = async () => { 
            try {
                const response = await fetch(`${HOST}/exercise/viewExercise`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setExerciseList(data); 
            } catch (error) {
                console.error("Error fetching exercise list: ", error);
            }
        };

        fetchExerciseLogs();
        fetchExerciseList();
    }, []);

    const fetchExerciseLogs = async () => {
        try {
            const response = await fetch(`${HOST}/exercise/viewExerciseLog`); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setExerciseLogs(data);
        } catch (error) {
            console.error("Error fetching exercise logs: ", error);
        }
    };

    const fetchExerciseList = async () => { 
        try {
            const response = await fetch(`${HOST}/exercise/viewExercise`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setExerciseList(data);
        } catch (error) {
            console.error("Error fetching exercise list: ", error);
        }
    };

    const handleCheck = (id) => {
        // Use your function to get the correct local date for Kuala Lumpur
        const todayDate = getLocalDateForKualaLumpur().split('T')[0];
        
        // Find the exercise log for today and the selected exercise ID
        const todayLog = exerciseLogs.find(log => log.exercisecompleted === id && log.date === todayDate);
        
        // Set the exercise details from today's log if it exists
        if (todayLog) {
            setExerciseDetails(todayLog.exercisedetails);
        } else {
            // Reset or set to default value if no log exists for today
            setExerciseDetails('');
        }
        
        // Set the selected exercise ID and open the modal
        setSelectedExercise(id);
        setIsModalOpen(true);
    };
    
    

    const handleSave = async () => {
        if (selectedExercise && exerciseDetails) {
            try {
                // Get the current date/time in Kuala Lumpur timezone
                const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"}));
                // Correctly set to the start of the day for consistency
                now.setHours(0, 0, 0, 0);
                const correctedDate = now.toISOString();
    
                const response = await fetch(`${HOST}/exercise/addOrUpdateExerciseLog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        exerciseId: selectedExercise,
                        exerciseDetail: exerciseDetails,
                        date: correctedDate, // Use the corrected date
                    }),
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const data = await response.json();
                console.log(data); 
                alert("Exercise details updates successfully!");
                setIsModalOpen(false);
                fetchExerciseList();
                fetchExerciseLogs();
                setIsEditModalOpen(false);

    
                // Additional code for after saving...
            } catch (error) {
                console.error('Error saving exercise log:', error);
            }
        }
    };
    
    
    

 
const handleSaveExercise = async () => {
    try {
      const response = await fetch(`${HOST}/exercise/updateExerciseName`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editableExercise.id,
          newName: editableExercise.name,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      alert('Exercise updated successfully.');
      setIsEditModalOpen(false);
      fetchExerciseList();
      fetchExerciseLogs();
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };
  

  const handleDeleteExercise = async () => {
    // Confirm with the user before proceeding to delete
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        const response = await fetch(`${HOST}/exercise/deleteExercise/${editableExercise.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        setIsEditModalOpen(false);
        fetchExerciseList();
        alert('Exercise deleted successfully.'); // Optional: inform the user of the success
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Failed to delete exercise.'); // Inform the user of the failure
      }
    } else {
      // If user clicks 'Cancel', log it or handle accordingly
      console.log('Exercise deletion was cancelled.');
    }
  };
  
  
    

    const handleClose = () => {
        setIsModalOpen(false); 
        setSelectedExercise(null); 
        setIsEditModalOpen(false);
    };


    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    // const allDatesInRange = generateDateRange(startDate, endDate);

    // Sort dates in descending order
    allDatesInRange.sort((a, b) => new Date(b) - new Date(a));


const groupedExerciseLogs = exerciseLogs.reduce((acc, log) => {
    // Extract the date in 'YYYY-MM-DD' format
    const logDate = log.date;
    // If the acc doesn't have an entry for this date, create an empty array for it
    if (!acc[logDate]) {
        acc[logDate] = [];
    }
    // Push the current log to the array for this date
    acc[logDate].push(log);
    return acc;
  }, {});

  // Add empty arrays for dates without exercise logs
  allDatesInRange.forEach(date => {
    if (!groupedExerciseLogs[date]) {
      groupedExerciseLogs[date] = []; // Add an empty array to indicate no records
    }
  });

  const handlePastWeek = () => {
    setCurrentStartDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() - 7);
        return newDate;
    });
};

const handleNextWeek = () => {
    setCurrentStartDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 7);
        return newDate;
    });
};

useEffect(() => {
    const fetchExerciseLogsForWeek = async () => {
        // Define the end date of the week based on the current start date
        let endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + 6);

        try {
            // Update the fetch URL with the correct query parameters for date range
            const response = await fetch(`${HOST}/exercise/viewExerciseLog?startDate=${currentStartDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setExerciseLogs(data);
        } catch (error) {
            console.error("Error fetching exercise logs: ", error);
        }
    };

    // Call the function to fetch logs
    fetchExerciseLogsForWeek();

    // Recalculate the allDatesInRange to reflect the current week
    let newEndDate = new Date(currentStartDate);
    newEndDate.setDate(newEndDate.getDate() + 6);
    setAllDatesInRange(generateDateRange(currentStartDate, newEndDate));

}, [currentStartDate]);

const todayDate = new Date().toISOString().split('T')[0];

const isExerciseLoggedToday = (exerciseId) => {
    // Ensure the date is in the same format as the logs for accurate comparison
    const todayDate = getLocalDateForKualaLumpur().split('T')[0];
    // console.log("tarikh now : ", todayDate)
    return exerciseLogs.some(log => log.exercisecompleted === exerciseId && log.date.startsWith(todayDate));
};

  
    return (
        <div className="container mx-auto px-4 py-8 bg-darkblue min-h-screen">
            <div className="text-center my-6">
    <h1 className="text-5xl font-bold mb-4" style={{ color: "WHITE" }}>FITNESS TRACKER</h1>
    <div className="flex justify-center gap-4 flex-wrap">
        {/* Any additional content can be styled similarly */}
    </div>
    <button
    className="my-4 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
    onClick={openNewExerciseModal}
    style={{ backgroundColor: "#7E2553", color: "white", hover: { backgroundColor: "#FF004D" } }}
>
    Add New Exercise
</button>
</div>



            {/* 'Add New Exercise' Modal */}
            {isNewExerciseModalOpen && (
    <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0" style={{ backgroundColor: "#1D2B53", opacity: "0.75" }}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ backgroundColor: "#1D2B53" }}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium" style={{ color: "#FAEF5D" }}>
                                Add New Exercise
                            </h3>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Exercise name"
                                    value={newExerciseName}
                                    onChange={handleNewExerciseNameChange}
                                    className="mt-2 p-2 w-full rounded-md"
                                    style={{ backgroundColor: "whitesmoke", color: "#1D2B53", borderColor: "#7E2553" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse" style={{ backgroundColor: "#1D2B53" }}>
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleSaveNewExercise}
                        style={{ backgroundColor: "#7E2553", color: "white", hover: { backgroundColor: "#FF004D" } }}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={closeNewExerciseModal}
                        style={{ backgroundColor: "#FF004D", color: "white", hover: { backgroundColor: "#7E2553" } }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
)}


            <div className="mt-5 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#FAEF5D" }}>Exercise List</h2>
<div className="space-y-4">
{exerciseList.map((exercise) => (
    <div onClick={() => openEditModal(exercise)} key={exercise.id} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: "#1D2B53", color: "#FAEF5D", borderLeft: "2px solid #FAEF5D", borderBottom: "2px solid #FAEF5D", cursor: "pointer" }}>
    <p style={{ color: "whitesmoke" }}>
        <strong style={{ fontSize: '1.25em' }}>{exercise.name}</strong>
    </p>
        {isExerciseLoggedToday(exercise.id) ? (
            <button
                onClick={() => handleCheck(exercise.id)}
                className="py-2 px-4 rounded transition duration-150 ease-in-out"
                style={{ backgroundColor: "#7E2553", color: "#FAEF5D" }}
            >
                Edit
            </button>
        ) : (
            <div
                onClick={() => handleCheck(exercise.id)}
                className="flex justify-center items-center cursor-pointer"
                style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: "white",
                    color: "#7E2553",
                    borderRadius: '50%',
                    border: '2px solid #7E2553',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
            >
                <i className="fas fa-check text-7E2553" style={{ fontSize: '1rem' }}></i>
            </div>
        )}
    </div>
))}


</div>

            {isEditModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
    <div className="relative mx-auto p-6 w-full max-w-xl shadow-xl rounded-2xl" style={{ backgroundColor: "#1D2B53" }}>
      <div className="text-center space-y-4">
        <input
          type="text"
          value={editableExercise.name}
          onChange={handleNameChange}
          className="w-full p-2 text-lg rounded"
          style={{ backgroundColor: "whitesmoke", color: "#1D2B53", borderColor: "#7E2553" }}
        />
        <div className="flex justify-center space-x-4 mt-4">
          
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="py-2 px-4 rounded font-bold transition ease-in-out duration-150"
            style={{ backgroundColor: "#FAEF5D", color: "#1D2B53", borderColor: "#7E2553" }}
          >
            Close
          </button>
          <button
            onClick={handleDeleteExercise}
            className="py-2 px-4 rounded font-bold transition ease-in-out duration-150"
            style={{ backgroundColor: "#FF004D", color: "white", borderColor: "#7E2553" }}
          >
            Delete
          </button>
          <button
            onClick={handleSaveExercise}
            className="py-2 px-4 rounded font-bold transition ease-in-out duration-150"
            style={{ backgroundColor: "#7E2553", color: "white", borderColor: "#FAEF5D", hover: { backgroundColor: "#FF004D" } }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{isModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
        <div className="relative mx-auto p-6 w-full max-w-xl shadow-xl rounded-2xl" style={{ backgroundColor: "#1D2B53", color: "#FAEF5D" }}> 
            <div className="text-center">
                <h3 className="text-xl leading-6 font-medium mt-5" style={{ color: "#FAEF5D" }}>Exercise Details</h3>
                <div className="mt-2 px-7 py-1">
              
                </div>
                <div className="mx-auto flex items-center justify-center p-1">
                    <textarea
                        className="w-full min-h-[300px] p-4 rounded-lg shadow-sm resize-none"
                        placeholder="Edit details here..."
                        value={exerciseDetails}
                        onChange={(e) => setExerciseDetails(e.target.value)}
                        style={{ backgroundColor: "whitesmoke", color: "black", borderColor: "#7E2553" }}
                    ></textarea>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button
                        id="close-btn"
                        className="px-6 py-3 text-lg font-medium rounded-md shadow-sm transition duration-150 ease-in-out"
                        onClick={handleClose}
                        style={{ backgroundColor: "#FF004D", color: "white" }}
                    >
                        Close
                    </button>
                    <button
                        id="ok-btn"
                        className="px-6 py-3 text-lg font-medium rounded-md shadow-sm transition duration-150 ease-in-out"
                        onClick={handleSave}
                        style={{ backgroundColor: "#7E2553", color: "white" }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
)}




        </div>

        <div className="mt-10 space-y-4" style={{ color: "#FAEF5D" }}>
            <div className='text-center '>
    <h2 className="text-3xl font-bold mb-4" style={{ color: "#FAEF5D" }}>Exercise Logs</h2></div>
    <div className="flex justify-between my-4">
        <button
            className="font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            onClick={handlePastWeek}
            style={{ backgroundColor: "#7E2553", color: "white", hover: { backgroundColor: "#FF004D" } }}
        >
            Past Week
        </button>
        <button
            className="font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            onClick={handleNextWeek}
            style={{ backgroundColor: "#7E2553", color: "white", hover: { backgroundColor: "#FF004D" } }}
        >
            Next Week
        </button>
    </div>
    {allDatesInRange.map((date) => (
    <div key={date} className="p-4 rounded-lg" style={{ backgroundColor: "#1D2B53", borderLeft: "2px solid #FAEF5D", borderBottom: "2px solid #FAEF5D" }}>
        <h3 className="text-xl font-bold mb-2" style={{ color: "whitesmoke" }}>{date}</h3>
        {groupedExerciseLogs[date].length > 0 ? (
            groupedExerciseLogs[date].map((log) => (
                <div key={log.id} className="p-2 rounded-lg shadow mb-2" style={{ backgroundColor: "#7E2553", color: "whitesmoke" }}>
                    <p><strong>Exercise:</strong> {log.exercisename}</p>
                    <p><strong>Details:</strong> {log.exercisedetails}</p>
                </div>
            ))
        ) : (
        
            <p style={{color: "whitesmoke"}}>No exercise record found.</p>

           
        )}
    </div>
))}

</div>




        </div>
    );
};

export default Home;
