import { Router } from 'express'
import {
  createCourse, deleteCourse, enrollFree, getCourse,
  listCourses, myCourses, saveProgress, updateCourse
} from '../controllers/courseController.js'
import { adminOnly, optionalAuth, protect } from '../middlewares/auth.js'

const router = Router()

router.get('/', optionalAuth, listCourses)
router.get('/mine', protect, myCourses)            // avant /:id
router.get('/:id', optionalAuth, getCourse)

router.post('/', protect, adminOnly, createCourse)
router.put('/:id', protect, adminOnly, updateCourse)
router.delete('/:id', protect, adminOnly, deleteCourse)

router.post('/:id/enroll', protect, enrollFree)
router.post('/:id/progress', protect, saveProgress)

export default router
