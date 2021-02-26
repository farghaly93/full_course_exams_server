const express = require('express');
var router = express.Router();
const adminControls = require('../controls/admin');
const adminAuth = require('../middlewares/adminAuthorization');


router.get('/getUsers/:type', adminControls.getUsers);
router.get('/getStageUsers/:stage', adminControls.getStageUsers);
router.get('/deleteUser/:id', adminAuth, adminControls.deleteUser);
router.get('/toggleUserRole/:id', adminAuth, adminControls.toggleUserRole);
router.get('/confirmUser/:id', adminAuth, adminControls.confirmUser);


router.get('/addVisitor', adminControls.addVisitor);
router.get('/getVisits', adminAuth, adminControls.getVisits);
router.get('/getDashboardData', adminAuth, adminControls.getDashboardData);


router.post('/uploadQuestions', adminAuth, adminControls.uploadQuestions);
router.get('/fetchExam/:type/:id', adminControls.fetchExam);
router.get('/deleteExam/:id/:year/:stage', adminAuth, adminControls.deleteExam);
router.get('/fetchExams', adminControls.fetchExams);
router.get('/fetchExamForUser/:stage/:userId/:number/:type', adminControls.fetchExamForUser);
router.get('/fetchExamById/:type/:id', adminControls.fetchExamById);
router.post('/filterExams/:type', adminControls.filterExams);
router.get('/testedOrNot/:stage/:number/:userId', adminControls.testedOrNot);
router.get('/getUsersExam/:stage/:type', adminControls.getUsersExam);
router.post('/editExam/:id', adminAuth, adminControls.editExam);
router.post('/sendSolution', adminControls.sendSolution);
router.post('/sendCorrection/:solutionId', adminAuth, adminControls.sendCorrection);
router.post('/sendInstructions', adminControls.sendInstructions);
router.patch('/updateAdminData', adminAuth, adminControls.updateAdminData);
router.get('/getAdminData', adminControls.getAdminData);
router.get('/getStudentsNumbers/:stage', adminControls.getStudentsNumbers);
router.get('/getStudentExams/:userId', adminControls.getStudentExams);
router.get('/getCorrectedStudentExams/:userId', adminControls.getCorrectedStudentExams);
router.post('/uploadVideo', adminAuth, adminControls.uploadVideo);
router.get('/deleteVideo/:id/:stage', adminAuth, adminControls.deleteVideo);
router.get('/fetchVideos/:userId/:year/:stage/:unit', adminControls.fetchVideos);
router.get('/fetchVideo/:id', adminControls.fetchVideo);
router.get('/getUnsolvedExams/:stage/:userId', adminControls.getUnsolvedExams);
router.post('/putSolution', adminAuth, adminControls.putSolution);
router.get('/fetchSolutionForAdmin/:id', adminAuth, adminControls.fetchSolutionForAdmin);
router.patch('/putBonus/:user/:degree', adminAuth, adminControls.putBonus);
router.get('/getStageStudentsOrder/:stage/:type', adminControls.getStageStudentsOrder);
router.delete('/removeCorrection/:id/:examId/:userId', adminAuth, adminControls.removeCorrection);
router.get('/unwindUnits', adminControls.unwindUnits);
router.post('/updateAllowedUnits/:id', adminAuth, adminControls.updateAllowedUnits);
router.post('/setExamsOut', adminAuth, adminControls.setExamsOut);
router.get('/getOutExams/:stage', adminAuth, adminControls.getOutExams);


router.get('/getVisitorExams/:stage/:unit', adminControls.getVisitorExams);
router.get('/getVisitorExam/:id/:userId', adminControls.getVisitorExam);
router.get('/getVisitorProgress/:stage/:userId', adminControls.getVisitorProgress);


module.exports = router;
