function generateCalendar(date) {                                             //Calendar    
  const calendar = document.getElementById("CalendarContainer");
  calendar.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalSquares = 42;

  for (let i = 0; i < firstDayIndex; i++) {                                 //Previous Month 
    const emptyCell = document.createElement("div");
    emptyCell.className = "CalendarItem empty";
    calendar.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {                            //StartCalendar
    const dayCell = document.createElement("div");
    dayCell.className = "CalendarItem";
    dayCell.textContent = day;
    calendar.appendChild(dayCell);
  }

  const usedSquares = firstDayIndex + daysInMonth;                           //Next Month
  for (let i = usedSquares; i < totalSquares; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "CalendarItem empty";
    calendar.appendChild(emptyCell);
  }
}

async function fetchEvents() {
  const eventsListContainer = document.getElementById('eventList');

  try {
    const response = await fetch('https://moviegoercalendar.onrender.com/events');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const events = await response.json();
    eventsListContainer.innerHTML = '';

    events.forEach(event => {
      const eventdate = new Date(event.release);
      const formattedDate = eventdate.toISOString().split('T')[0];

      const eventItem = document.createElement('li');
      eventItem.className = 'EventItem visible';

      const eventText = document.createElement('span');
      eventText.textContent = `${event.name} ------- Date: ${formattedDate}`;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';


      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`Delete "${event.name}"?`)) return;

        try {
          const deleteResponse = await fetch(`https://moviegoercalendar.onrender.com/events/${event.id}`, {
            method: 'DELETE'
          });

          const result = await deleteResponse.json();
          console.log(result);

          fetchEvents();
        } catch (err) {
          console.error('Error deleting event:', err);
        }
      });

      eventItem.appendChild(eventText);
      eventItem.appendChild(deleteBtn);
      eventsListContainer.appendChild(eventItem);
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    eventsListContainer.innerHTML = '<li>Error loading events.</li>';
  }
}

let firstToggle = true;                                                       //Toggle       
function toggleEventVisibility() {
  const eventItems = document.querySelectorAll('.EventItem');
  
  eventItems.forEach(function(item) {
    if (firstToggle) {
      item.classList.remove('visible');
      item.classList.add('hidden');
    } else {
      item.classList.toggle('hidden');
      item.classList.toggle('visible');
    }
  });
  firstToggle = false;
}


function toggleEventVisibility() {
  const eventItems = document.querySelectorAll('.EventItem');
  eventItems.forEach(function(item) {
    item.classList.toggle('hidden');
  });
}


async function createEvent(eventData) {                             //POST new event
  try {
    const response = await fetch('https://moviegoercalendar.onrender.com/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    if (response.ok) {
      const newEvent = await response.json();
      console.log('Event created:', newEvent);
      return newEvent;
    } else {
      const errorData = await response.json();
      console.error('Error creating event:', errorData.error);
      return null;
    }
  } catch (error) {
    console.error('Error in POST request:', error);
  }
}

function handleCreateEvent() {                                      //Create Event
  const eventName = document.getElementById('eventName').value;
  const eventRelease = document.getElementById('eventRelease').value;

  if (!eventName || !eventRelease) {
    alert("Please provide both event name and release date.");
    return;
  }

  const newEvent = {
    name: eventName,
    release: eventRelease
  };

  createEvent(newEvent).then((event) => {
    if (event) {
      alert('Event created successfully!');
      console.log('New event added:', event);
      var elements = document.querySelectorAll(".hidden, .visible");
    
    if (elements.length > 0) {
        elements.forEach(function(element) {
            if (element.classList.contains("hidden")) {
                element.classList.remove("hidden");
                element.classList.add("visible");
            } else {
                element.classList.remove("visible");
                element.classList.add("hidden");
            }
        });
    }
      document.getElementById('eventName').value = '';
      document.getElementById('eventRelease').value = '';
      Showcreateeventform.textContent = "Add new Event?";

      fetchEvents();
    }
  });
}

function hideUnhide() {                                            //Hide form      
    var elements = document.querySelectorAll(".hidden, .visible");
    
    if (elements.length > 0) {
        elements.forEach(function(element) {
            if (element.classList.contains("hidden")) {
                element.classList.remove("hidden");
                element.classList.add("visible");
                Showcreateeventform.textContent = "Hide event form?";
            } else {
                element.classList.remove("visible");
                element.classList.add("hidden");
                Showcreateeventform.textContent = "Add new Event?";
            }
        });
    }
}

async function deleteMovie(id) {
  try {
    const response = await fetch(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Delete response:', data);
  } catch (error) {
    console.error('Error deleting movie:', error);
  }
}

function addMovieButtons() {
  const movieItems = document.querySelectorAll('.MovieItem');

  movieItems.forEach(item => {
    if (!item.querySelector('.addToEventBtn')) {
      const button = document.createElement('button');
      button.textContent = "Add to Events";
      button.className = "addToEventBtn";

      const [namePart, datePart] = item.textContent.split(' - Release Date: ');
      const movieData = {
        name: namePart.trim(),
        release: datePart.trim()
      };

      button.addEventListener('click', async () => {
        const newEvent = await createEvent(movieData);
        if (newEvent) {
          alert(`"${movieData.name}" added to events!`);
          fetchEvents();
        }
      });

      item.appendChild(button);
    }
  });
}

addMovieButtons();


document.getElementById('Showcreateeventform').addEventListener('click', hideUnhide);
document.getElementById('createEventButton').addEventListener('click', handleCreateEvent);

generateCalendar(new Date());
fetchEvents();


