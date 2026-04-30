const API = {
    getData: () => {
        return JSON.parse(localStorage.getItem("appointmentsData"));
    },

    saveData: (data) => {
        localStorage.setItem("appointmentsData", JSON.stringify(data));
    },

    createAppointment: (appointment) => {
        const data = API.getData();
        data.appointments.push(appointment);
        API.saveData(data);
        return data;
    },

    cancelAppointment: (index) => {
        const data = API.getData();
        const removed = data.appointments.splice(index, 1)[0];
        data.history.push({
            ...removed,
            action: "Cancelled",
            timestamp: new Date().toLocaleString()
        });
        API.saveData(data);
        return data;
    },

    rescheduleAppointment: (index, newDate, newTime) => {
        const data = API.getData();
        const appt = data.appointments[index];

        data.history.push({
            ...appt,
            action: "Rescheduled",
            oldDate: appt.date,
            oldTime: appt.time,
            newDate,
            newTime,
            timestamp: new Date().toLocaleString()
        });

        appt.date = newDate;
        appt.time = newTime;
        appt.status = "Rescheduled";

        API.saveData(data);
        return data;
    }
};