import express from 'express';
import passport from 'passport';
import Todo from '../models/Todo.js';
const router = express.Router();

//로그인한 유저의 todolist CRUD 구현
//로그인 하지 않은 경우 접근 불가
router.use((req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
    }
    next();
});

router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.status(200).json(todos);
      } catch (error) {
        res.status(500).send('Error fetching todos');
      }
    });
router.post('/newPage', async (req, res) => {
    try {
        const { title, description } = req.body;
        const todo = new Todo({ title, description, userId: req.user._id });
        await todo.save();
        res.status(200).send('Todo created successfully');
      } catch (error) {
        res.status(500).send('Error creating todo');
      }
});
router.put('/updatePage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Todo.findByIdAndUpdate(id, req.body);
        res.status(200).send('Todo updated successfully');
      } catch (error) {
        res.status(500).send('Error updating todo');
      }
  });
router.delete('/deletePage/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await Todo.findByIdAndDelete(id);
        res.status(200).send('Todo deleted successfully');
      } catch (error) {
        res.status(500).send('Error deleting todo');
      }
  });

export default router;