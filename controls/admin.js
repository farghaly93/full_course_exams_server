const Visitors = require('../models/visitors');
const Users = require('../models/users');
const Exam = require('../models/exams');
const Solutions = require('../models/solutions');
const SolutionModels = require('../models/solutionModels');
const AdminData = require('../models/adminData');
const Videos = require('../models/lessons');
const exams = require('../models/exams');
const VisitorExams = require('../models/visitorExams');
const OutExams = require('../models/outExams');
const solutionModels = require('../models/solutionModels');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'farghaly-developments',
    api_key: '789929815277853',
    api_secret: 'GRYCOy1KymmaOkGu6BuPVNH0VLc'
})


/////////////////// MAIN INFORMATION ///////////////////////////

///////////////////////////////////////////// USERS /////////////////////////////////
exports.getUsers = async(req, res) => {
    try {
        const type = req.params.type;
        const users = await Users.find({type});
        res.json({users});
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}
exports.getStageUsers = async(req, res) => {
    try {
        const users = await Users.find({stage: req.params.stage, role: 0});
        res.json({users});
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}
exports.deleteUser = async(req, res) => {
    try {
        const id = req.params.id;
        const deluser = await Users.deleteOne({_id: id});
        if(deluser) {
            await Solutions.deleteMany({userId: id});
            const users = await Users.findOne({_id: id});
            res.json({user});
        } else {
            res.json({message: 'Ad not added error happened try again...'});
        }
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}

exports.toggleUserRole = async(req, res) => {
    try {
        const id = req.params.id;
        const updateUserRole = await Users.update({_id: id}, {$bit: {role: {xor: 1}}});
        let users = [];
        if(updateUserRole.nModified===1) {
            user = await Users.findOne({_id: id});
        }
        res.json({user});;
} catch(err) {
    res.json({message: 'Ad data problem...'});
    }
}
exports.confirmUser = async(req, res) => {
    try {
        const id = req.params.id;
        const updateUserRole = await Users.update({_id: id}, {$bit: {confirmed: {xor: 1}}});
        let users = [];
        if(updateUserRole.nModified===1) {
            user = await Users.findOne({_id: id});
        }
        res.json({user});;
} catch(err) {
    res.json({message: 'Ad data problem...'});
    }
}
exports.updateAllowedUnits = async(req, res) => {
    try {
        const update = await Users.updateOne({_id: req.params.id}, {units: req.body.units});
        if(update.nModified === 1) {
            const user = await Users.findOne({_id: req.params.id});
            res.json({user , done: true});
        } else {
            res.json({done: false});
        }
    } catch(err) {
        res.json({done: false});
    }
}

exports.addVisitor = async(req, res) => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const info = await Visitors.find({month, year});
    if(info.length > 0) 
        await Visitors.update({month, year}, {$inc: {visitors: 1}});
    else 
        await new Visitors({month, year, visitors: 1}).save();
        res.json({added: true})
}
exports.getVisits = async(req, res) => {
    try {
        const year = new Date().getFullYear();
        const visits = await Visitors.find({year});
        res.json({visits});
    } catch(err) {
        res.json({err});
    }
}
exports.getDashboardData = async(req, res) => {
    try {
        const c1 =  Exam.find().count();
        const c2 = Users.find().count();
        const c3 = Solutions.find({done: true}).count();
        const c4 = Solutions.find({done: false}).count();
        const [exams, users, corrected, uncorrected] = await Promise.all([c1, c2, c3, c4]);
        res.status(200).json({exams, users, corrected, uncorrected});
    } catch(err) {
        console.log(err)
        res.json({err});
    }
}
////////////////////////////// EXAMS ////////////////////////////////////////////////////////////

exports.uploadQuestions = async(req, res) => {
    try {
        const exam = req.body;
        const year = exam.year;
        const stage = exam.stage;
        const unit = exam.unit;
        const number = exam.number;
        const model = exam.model;
        const sections = exam.sections;
        const type = exam.type;

        const obj = type === 'regular'?{year, stage, number, model}: {year, stage, unit, number};
        
        function upload(s, q) {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(sections[s].questions[q].question, (err, result) => {
                    if(err) return reject(err);
                    return resolve({url: result.url, s, q});
                })
            })
        }
        const promises = [];
        sections.forEach(async(seq, s) => {
            seq.questions.forEach(async(ques, q) => {
                if(sections[s].questions[q].question.split('data:image').length > 1) {
                    promises.push(upload(s, q));
                }
            })
        })
        const results = await Promise.all(promises);
        sections.forEach((sec, s) => {
            sec.questions.forEach((ques, q) => {
                const data = results.find(res => {
                   return  res.s === s && res.q === q;
                })
                if(data) sections[s].questions[q].question = data.url;
            })
        })
        const exams_collection = type==='visitor'? VisitorExams: Exam;
        const existingExams = await exams_collection.find(obj);
        let done = false;
        
        // console.log(existingExams);
        // return;
        if(existingExams.length > 0) {
            const update = await exams_collection.updateOne(obj, {...exam});
            if(update.nModified === 1) {
                await SolutionModels.deleteOne({examId: existingExams[0]._id});
                await Solutions.deleteMany({examId: existingExams[0]._id});
                done = true
            };
        } else {
            const addNew = await new exams_collection({...exam}).save();
            if(addNew) done = true;
        }
        res.json({done});
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.editExam = async(req, res) => {
    try {
        const exam = req.body;
        const _id = req.params.id;
        const update = await Exam.update({_id}, {year: exam.year, stage: exam.stage, number: exam.number, model: exam.model, deadLine: exam.deadLine, sections: exam.sections, timer: exam.timer});
        if(update.nModified === 1) {
            const del = await SolutionModels.deleteOne({examId: _id});
            if(del) { 
                res.json({done: true});
            }
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.fetchExam = async(req, res) => {
    try {
        const id = req.params.id;
        const type = req.params.type;
        let exam = {};
        if(type === 'regular') exam = await Exam.findOne({_id: id});
        if(type === 'visitor') exam = await VisitorExams.findOne({_id: id});
        res.json({exam});
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.deleteExam = async(req, res) => {
    try {
        const id = req.params.id;
        const year = +req.params.year;
        const stage = req.params.stage;
        const deleteExam = await Exam.deleteOne({_id: id});
        const exams = await Exam.find({year, stage}).sort({_id: -1});
        res.json({exams});
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.fetchExams = async(req, res) => {
    try {
        const exams = await Exam.find().sort({_id: -1});
        res.json({exams});
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.filterExams = async(req, res) => {
    try {
        const type = req.params.type;
        const filter = {...req.body};
        const number = req.body.number; 
        delete filter['number'];
        const exams_collection = type==='visitor'? VisitorExams: Exam;

        if(number >0) filter['number'] = number;
        const exams = await exams_collection.find(filter).sort({_id: -1});
        res.json({exams});
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.fetchExamForUser = async(req, res) => {
    try {
        const stage = req.params.stage;
        const number = req.params.number;
        const type = req.params.type;

        const isLastNumberExamTested = await Exam.find({stage, number, type, students: req.params.userId});

        if(isLastNumberExamTested.length > 0) {
            res.json({exam: isLastNumberExamTested[0]});
        } else {
            const lastNumberExams = await Exam.find({stage, number});
            const randomTime = Math.floor(Math.random()*500);
            const numOfExamModels = lastNumberExams.length;
            let i = 0;
            const changeIndex = setInterval(()=>{
                if(i === numOfExamModels-1) i = 0;
                else i++;
            }, 30);
            setTimeout(async () => {
                clearInterval(changeIndex);
                const randomExam = lastNumberExams[i];
                const randomExamId = randomExam._id;
                const randomExamStudents = [...randomExam.students];
                randomExamStudents.push(req.params.userId);
                const addUserToExamTable = await Exam.update({_id: randomExamId}, {students: randomExamStudents});
                if(addUserToExamTable.nModified === 1) {

                    res.json({exam: randomExam});
                }
            }, randomTime)
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////      /////////////////////       /////////////////////     ////////////////////

// exports.fetchExamForUserr = async(req, res) => {
//     try {
//         const stage = req.params.stage;
//         const number = req.params.number;
//         console.log(stage, number);

//         const isLastNumberExamTested = await Exam.find({stage, number, student: req.params.userId});

//         if(isLastNumberExamTested.length > 0) {
//             res.json({exam: isLastNumberExamTested[0]});
//         } else {
//             const lastNumberExams = await Exam.find({stage, number, student: 'empty'});
//             console.log(lastNumberExams);

//             if(lastNumberExams.length > 0) {
//                 const randomIndex = Math.floor(Math.random()*lastNumberExams.length);
//                 const randomExam = lastNumberExams[randomIndex];
//                 const randomExamId = randomExam._id;
//                 const addUserToExamTable = await Exam.update({_id: randomExamId}, {student: req.params.userId});
//                 if(addUserToExamTable.nModified === 1) {
//                     res.json({exam: randomExam});
//                 } else {
//                     res.json({exam: null});
//                 }

//             }
//         }
//     } catch(err) {
//         console.log(err);
//         res.json({err});
//     }
// }
////////////////////   ////////////////////////////       /////////////////////////      /////////////////////
///////////////////////////////          //////////////////////////////         ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.fetchExamById = async(req, res) => {
    try {
        let exam = {};
        if(req.params.type==='regular') exam = await Exam.findOne({_id: req.params.id});
        if(req.params.type==='visitor') exam = await VisitorExams.findOne({_id: req.params.id});
        console.log(exam)

        res.json({exam});
    } catch(err) {
        console.log(err);
        res.json({err})
    }
}
exports.sendSolution = async(req, res) => {
    try {
        const studentSolution = req.body;
        const solutionModel = await SolutionModels.find({examId: req.body.examId});
        if(solutionModel.length > 0) {
            studentSolution.sections.forEach((sec, s) => {
                sec.questions.forEach((ques, q) => {
                    if(ques.question === solutionModel[0].sections[s].questions[q].question) {
                        if(ques.answer === solutionModel[0].sections[s].questions[q].answer) {
                           studentSolution.sections[s].questions[q].degree = studentSolution.sections[s].questions[q].fullDegree;
                        } else if(ques.answer === '') {
                            studentSolution.sections[s].questions[q].degree = 0;
                        }
                         else {
                            studentSolution.sections[s].questions[q].degree = 0;
                            studentSolution.sections[s].questions[q].correction = solutionModel[0].sections[s].questions[q].answer;
                         }
                    }
                })
            });
        }
        // console.log(req.body.examId, solutionModel[0].sections[0].questions[0], studentSolution.sections[0].questions[0]);
        // return;
        const isTested = await Solutions.find({userId: req.body.userId, number: req.body.number});
        if(isTested.length > 0) {
            if(req.body.unit) {
                if(isTested[0].unit == req.body.unit) return;
            } else {
            error.throw('Repeated solution');
            return;
            }
        }
        let solutions;
        if(solutionModel.length > 0) {
            studentSolution['done'] = true;
            solutions = await new Solutions(studentSolution).save();
            if(solutions) {
                res.json({exam: studentSolution});
            } else {
                res.json({done: false});
            }
        } else {
            solutions = await new Solutions(studentSolution).save();
            if(solutions) {
                res.json({done: true});
            } else {
                res.json({done: false});
            }
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.putSolution = async(req, res) => {
    try {
        console.log(req.body);
        examId=  req.body.examId;
        const models = await SolutionModels.find({examId: examId});
        let done = false;
        if(models.length > 0) {
            const update = await SolutionModels.updateOne({examId}, req.body);
            if(update.nModified === 1) {
                done = true;
            }
        } else {
            const add = await new SolutionModels(req.body).save();
            if(add) {
                done = true;
            }
        }
        if(done) {
            await Solutions.deleteMany({examId});
            res.json({done: true});
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err)
    }
}
exports.fetchSolutionForAdmin = async(req, res) => {
    try {
        const examId=  req.params.id;
        const models = await SolutionModels.find({examId: examId});
        if(models.length > 0 && models[0].sections.length>0) {
            res.json({solution: models[0]})
            } else {
                res.json({})
            }
    } catch(err) {
        console.log(err)
    }
}
exports.testedOrNot = async(req, res) => {
    try {
        const stage = req.params.stage;
        const number = req.params.number;
        const userId = req.params.userId;
        const solutions = await Solutions.find({stage, number, userId});
        if(solutions.length > 0) {
            res.json({tested: true});
        } else {
            res.json({tested: false});
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.getUsersExam = async(req, res) => {
    try {
        const stage = req.params.stage;
        const type = req.params.type;
        const filter = type==='examsOnly'? {$in: ['examsOnly', 'fullCourse']}: 'exams'
        const users = await Users.find({stage, type: filter , role: 0});
        const lastExams = await Exam.find({stage}).sort({_id: -1}).limit(1);
        const lastExamUsers = await Solutions.find({number: lastExams[0]?lastExams[0].number: ''});
        let lastExamStudents = [...lastExamUsers].map(user => {
            return user.userId;
        })
        res.json({users, lastExamStudents});
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}
exports.getStudentExams = async(req, res) => {
    try {
        const userId = req.params.userId;
        const exams = await Solutions.find({userId}).sort({_id: -1});
        res.json({exams});
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}
exports.getCorrectedStudentExams = async(req, res) => {
    try {
        const userId = req.params.userId;
        const user = await Users.findOne({_id: userId});
        const outExams = await OutExams.find({stage: user.stage});
        const exams = await Solutions.find({userId, done: true, number: {$nin: outExams[0].exams}}).sort({_id: -1});
        // const exams = await Solutions.find({userId, done: true}).sort({_id: -1});
        res.json({exams});
} catch(err) {
    res.json({message: 'Ad not added category...'});
    }
}
exports.sendCorrection = async(req, res) => {
    try {
        req.body['done'] = true;
        const correction = await Solutions.update({_id: req.params.solutionId}, req.body);
        if(correction.nModified === 1) {
            res.json({done: true});
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.sendInstructions = async(req, res) => {
    try {
        const update = await AdminData.update({admin: 1}, {instructions: req.body.instructions});
        if(update.nModified === 1) {
            res.json({done: true});
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err);
        res.json({err});
    }
}
exports.getAdminData = async(req, res) => {
    try {
        const adminData = await AdminData.find();
        if(adminData) {
            res.json({adminData: adminData[0]});
        } else {
            await new AdminData({admin: 1}).save();
            res.json({adminData: {}});

        }
    } catch(err) {
        console.log(err);
        res.json({err});
     }
}
exports.updateAdminData = async(req, res) => {
    try {
        const adminData = await AdminData.find({admin: 1});
        if(adminData.length === 0) {
            await new AdminData({admin: 1}).save();
        }
        const update = await AdminData.update({admin: 1}, req.body);
        if(update.nModified === 1) {
            res.json({done: true});
        } else {
            res.json({done: false});
        }
    } catch(err) {
        console.log(err);
        res.json({err});
     }
}
exports.getStudentsNumbers = async(req, res) => {
    try {
        const users = await Users.find({stage: req.params.stage, role: 0}).count();
        res.json({users});
    } catch(err) {
        console.log(err);
        res.json({err});
     }
}
exports.uploadVideo = async(req, res) => {
    try {
        function uploadVideo(video) {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(
                    video,
                    (err, result) => {
                    if(err) return reject(err);
                    return resolve({url: result.url});
                })
            })
        }

        function uploadFile(file) {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(file, (err, result) => {
                    if(err) return reject(err);
                    return resolve({url: result.url});
                })
            })
        }

        if(req.files && req.files.video) {
            const vid = req.files.video;
            const {url} = await uploadVideo(vid.tempFilePath);
            req.body.videoPath = url;
            // req.body.publicId = public_id;
        } else {
            req.body.videoPath = req.body.video;
        }
        if(req.files && req.files.file) {
            const {url} = await uploadFile(req.files.file.tempFilePath);
            req.body.filePath = url;
            // req.body.filePublicId = public_id;
        } else {
            req.body.filePath = req.body.file;
        }
        let ok = false;
        const obj = {year: req.body.year, unit: req.body.unit, number: req.body.number, stage: req.body.stage};
        const videos = await Videos.find(obj);
        if(videos.length > 0) {
            const update = await Videos.updateOne(obj, req.body);
            if(update.nModified === 1) ok = true;
        } else {
            const newVideo = await new Videos(req.body).save();
            if(newVideo) ok = true;
        }
        if(ok) {
            res.json({done: true});
        } else {
            res.json({done: false});
        }

    } catch(err) {
        console.log(err);
        res.json({done: false})
    }
}
exports.deleteVideo = async(req, res) => {
    const del = await Videos.deleteOne({_id: req.params.id});
    // cloudinary.uploader.destroy(req.params.id, async(err, result) => {
    //     if(err) {
    //         console.log(err);
    //         return;
    //     }
    //     const del = await Videos.deleteOne({publicId: req.params.id});
    //     console.log(del);
    if(del) {
        const videos = await Videos.find({stage: req.params.stage});
        res.json({videos, done: true});
    } else {
        res.json({done: true});
    }
}
exports.fetchVideos = async(req, res) => {
    try {
        console.log('userId');

        const userId = req.params.userId;

        const user = await Users.findOne({_id: userId});
        let fetch = true;
        if(user.type !== 'fullCourse' && user.role !== 1) {
            fetch = false;
        }
        if(fetch) {
            const videos = await Videos.find({year: +req.params.year, stage: req.params.stage, unit: +req.params.unit});
            res.json({videos});
        }
    } catch(err) {
        console.log(err);
    }
}
exports.fetchVideo = async(req, res) => {
    try {
        const video = await Videos.findOne({_id: req.params.id});
        res.json({video});
    } catch(err) {
        console.log(err);
    }
}
exports.getUnsolvedExams = async(req, res) => {

    const stage = req.params.stage;
    const userId = req.params.userId;
    try {
        const unSolvedNumbers = [];
        const solvedNumbers = [];
        const solved = await exams.find({stage, students: userId});
        const count = solved.length;
        let i = 0;

        if(count===0) {
            getExamNUmbers();
            return;
        }
        solved.forEach(async(s) => {
            const isTested = await Solutions.find({userId, number: s.number});
            if(isTested.length>0) {
                solvedNumbers.push(s.number);
            }
            i++;
            if(i===count) {
                getExamNUmbers();
            }
        });

        async function getExamNUmbers() {
            const unSolved = await exams.find({stage, number: {$nin: solvedNumbers}});
            unSolved.forEach(unS => {
                if(unSolvedNumbers.includes(unS.number)) return;
                unSolvedNumbers.push(unS.number);
                });
                res.json({unSolvedExamsNumbers: unSolvedNumbers});
            }
    } catch(err) {
        console.log(err);
    }
}
exports.putBonus = async(req, res) => {
    try {
        const degree = req.params.degree;
        const user = req.params.user;
        const upd = await Users.updateOne({_id: user}, {bonus: degree});
        if(upd.nModified === 1) {
            res.json({done: true});
        }
    } catch(err) {
        console.log(err);
    }
}
exports.getStageStudentsOrder = async(req, res) => {
    try {
        examsNumbers = [];
        let fullDegree = 0;
        const stage = req.params.stage;
        const outExmas = await OutExams.find({stage});

        const examss = await exams.find({stage, number: {$nin: outExmas[0].exams}});
        console.log(examss.length)
        if(examss.length === 0) {
            res.json({fullDegree});
        }
        let go = false;
        examss.forEach((exam, i) => {
            if(!examsNumbers.includes(exam.number)) {
                examsNumbers.push(exam.number);
                go = true;
            } else {
                go = false;
            }
            exam.sections.forEach((sec, s) => {
                sec.questions.forEach((ques, q) => {
                if(go) {
                    fullDegree += ques.fullDegree;
                    }
                })
            })
                
            if(i===examss.length-1) {
                res.json({fullDegree});
            }
        });
    } catch(err) {
        console.log(err);
    }
}

exports.removeCorrection = async(req, res) => {
    try {
        const id = req.params.id;
        const examId = req.params.examId;
        const studentId = req.params.userId;

        let done = false;
        const exam = await exams.find({_id: examId});
        const students = exam[0].students;
        const studentIndex = [...students].indexOf(studentId);
        students.splice(studentIndex, 1);
        const del = await Solutions.deleteOne({_id: id});
        if(del) {
            const removeStudentFromExamStudents = await exams.updateOne({_id: examId}, {students: students});
            if(removeStudentFromExamStudents.nModified===1) done = true;
        }
        res.json({done});
    } catch(err) {
        console.log(err);
    }
}
exports.unwindUnits = async(req, res) => {
    try {
        const getUnits = (stage) => {
            return new Promise((resolve, reject) => {
                VisitorExams.aggregate([
                    {$match: {'stage': stage}},
                    {$unwind: '$unit'},
                    {$group: {_id: '$unit'}},
                    {$sort: {'unit': 1}}
                ],
                    function(err, data) {
                        if(err) return reject(err);
                        return resolve(data);
                    }
                );
            });
        }
        const one = await getUnits('one');
        const two = await getUnits('two');
        const three = await getUnits('three');

        res.json({one, two, three});
        } catch(err) {
            console.log(err)
        }
}
// exports.sendEmail = async(req, res) => {
//     try {
//         console.log(req.body)
//         var transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             user: 'miserable.farghaly93@gmail.com',
//             pass: 'farghaly_1993'
//           }
//         });
        
        // var mailOptions = {
        //   from: req.body.sender,
        //   to: req.body.admin,
        //   subject: req.body.subject,
        //   text: req.body.message
        // };
        
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error) {
//             console.log(error);
//             res.json({done: false});
//           } else {
//             res.json({done: true});
//           }
//         });
//     } catch(err) {
//         console.log(err);
//         res.json({err});
//      }
// }










exports.getVisitorExams = async(req, res) => {
    try {
        const stage = req.params.stage;
        const unit = req.params.unit;
        const exams = await VisitorExams.find({stage, unit});
        res.json({exams});
    }catch(err) {
        console.log(err);
    }
}
exports.getVisitorExam = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.params.userId;
        const answers = await Solutions.find({examId: id, userId});
        if(answers.length > 0) {
            res.json({type: 'solution', solution: answers[0]})
        } else {
            const exam = await VisitorExams.findOne({_id: id});
            res.json({type: 'exam', exam});
        }
    }catch(err) {
        console.log(err);
    }
}
exports.getVisitorProgress = async(req, res) => {
    try {
        const stage = req.params.stage;
        const userId = req.params.userId;
        const exams = await VisitorExams.count({stage});
        const answers = await Solutions.count({userId, done: true});
        const progress = Math.ceil((answers/exams)*100);
        console.log(exams, answers);
        res.json({progress});
    }catch(err) {
        console.log(err);
    }
}
exports.setExamsOut = async(req, res) => {
    try {
        const stage = req.body.stage;
        const exams = req.body.exams;
        console.log(stage, exams);

        const outExams = await OutExams.find({stage});
        let done = false;
        if(outExams.length>0) {
            const update = await OutExams.updateOne({stage}, {exams});
            if(update.nModified === 1) done = true;
        } else {
            const insert = await OutExams({stage, exams}).save();
            if(insert) done = true;
        }
        
        res.json({done});
    } catch(err) {
        console.log(err);
    }
}
exports.getOutExams = async(req, res) => {
    try {
        const stage = req.params.stage;
        const outExams = await OutExams.find({stage});
        res.json({outExams: outExams.length>0?outExams[0].exams: []});
    } catch(err) {
        console.log(err);
    }
}