const express = require('express');
const app = express();
const port = 3000;

let tasks = [
    { id: 1, title: "Completed Practical 1",  completed: true},
    { id: 2, title: "Completed Practical 2", completed: true},
    { id: 3, title: "Completed Practical 3", completed: true},
    { id: 4, title: "Build Express REST API", completed: true},
];


app.use(express.json());

app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

app.post('/tasks', (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: req.body.completed || false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {

    const id = Number(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.title = req.body.title ?? task.title;
    task.completed = req.body.completed ?? task.completed;

    res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(index, 1);

    res.status(200).json({
        message: "Task deleted successfully"
    });

});

app.get("/error", (req, res, next) => {
    next(new Error("Test Error"));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong"
    });
});






/*app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: "Hello"
    });
});

app.post('/', (req, res) => {
    res.status(200);
    console.log(req.body);
});*/


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/tasks`);
});