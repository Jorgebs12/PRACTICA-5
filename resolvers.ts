import { Collection, ObjectId } from "mongodb";
import { Teacher, TeacherModel } from "./types.ts";
import { Student, StudentModel } from "./types.ts";
import { Course, CourseModel } from "./types.ts";
import { formModelToTeacher } from "./utils.ts";
import { formModelToStudent } from "./utils.ts";
import { formModelToCourse } from "./utils.ts";


type Context = { 
    TeacherCollection: Collection<TeacherModel>;
    StudentCollection: Collection<StudentModel>;
    CourseCollection: Collection<CourseModel>;
}


export const resolvers = {
    Query: {
        students: async (_: unknown, __: unknown, context: {StudentCollection: Collection<StudentModel> }): Promise<Student[]> => {
            const studentModel = await context.StudentCollection.find().toArray();
            return studentModel.map((elem) => formModelToStudent(elem));
        },

        teachers: async (_: unknown, __: unknown, context: {TeacherCollection: Collection<TeacherModel> }): Promise<Teacher[]> => {
            const teacherModel = await context.TeacherCollection.find().toArray();
            return teacherModel.map((elem) => formModelToTeacher(elem));
        },

        courses: async (_: unknown, __: unknown, context: {CourseCollection: Collection<CourseModel> }): Promise<Course[]> => {
            const courseModel = await context.CourseCollection.find().toArray();
            return courseModel.map((elem) => formModelToCourse(elem));
        },

        student: async (_: unknown, { id }: { id: string }, context: {StudentCollection: Collection<StudentModel> }): Promise<Student | null> => {
            const studentModel = await context.StudentCollection.findOne({ _id: new ObjectId(id) });
            if(!studentModel) return null;
            return formModelToStudent(studentModel);
        },

        teacher: async (_: unknown, { id }: { id: string }, context: {TeacherCollection: Collection<TeacherModel> }): Promise<Teacher | null> => {
            const teacherModel = await context.TeacherCollection.findOne({ _id: new ObjectId(id) });
            if(!teacherModel) return null;
            return formModelToTeacher(teacherModel);
        },

        course: async (_: unknown, { id }: { id: string }, context: {CourseCollection: Collection<CourseModel> }): Promise<Course | null> => {
            const courseModel = await context.CourseCollection.findOne({ _id: new ObjectId(id) });
            if(!courseModel) return null;
            return formModelToCourse(courseModel);
        },
    },

    Student: {
        id: (parent: StudentModel): string => {
            return parent._id!.toString();
        },
        enrolledCourses: async (parent: StudentModel, __:unknown, ctx: Context): Promise<CourseModel[]> => {
            const idsss = parent.enrolledCourses;
            const autores = await ctx.CourseCollection.find({ _id: idsss }).toArray();   
            return autores;       
        },
    },


    Mutation: {

        enrollStudentInCourse: async (_: unknown, args: { studentId: string, courseId: string }, context: {CourseCollection: Collection<Course> }): Promise<Course | null> => {
            const { studentId, courseId } = args;
            const { value }: any  = await context.CourseCollection.findOneAndUpdate({ _id: new ObjectId(courseId) }, { $push: { studentIds: studentId } });
            return value ? formModelToCourse(value) : null;
        },

        removeStudentFromCourse: async (_: unknown, args: { studentId: string, courseId: string }, context: {CourseCollection: Collection<Course> }): Promise<Course | null> => {
            const { studentId, courseId } = args;
            const { value }: any = await context.CourseCollection.findOneAndUpdate({ _id: new ObjectId(courseId) }, { $pull: { studentIds: studentId } });
            return value ? formModelToCourse(value) : null;
        },


        
        createStudent: async (_: unknown, args: { name:string , email: string }, context: {StudentCollection: Collection<StudentModel> }): Promise<Student> => {
            const { name, email } = args;
            const { insertedId } = await context.StudentCollection.insertOne({ name, email, enrolledCourses: [] });
            const studentModel = {
              _id: insertedId,
              name,
              email,
              enrolledCourses: [],
            };
            return formModelToStudent(studentModel!);    
        },

        createTeacher: async (_: unknown, args: { name:string , email: string }, context: {TeacherCollection: Collection<TeacherModel> }): Promise<Teacher> => {
            const { name, email } = args;
            const { insertedId } = await context.TeacherCollection.insertOne({ name, email, coursesTaught: [] });
            const teacherModel = {
              _id: insertedId,
              name,
              email,
              coursesTaught: [],
            };
            return formModelToTeacher(teacherModel!);    
        },

        createCourse: async (_: unknown, args: { title:string , description: string, teacherId: string }, context: {CourseCollection: Collection<CourseModel> }): Promise<Course> => {
            const { title, description, teacherId } = args;
            const { insertedId } = await context.CourseCollection.insertOne({ title, description, teacherId, studentIds: [] as string[] });
            const courseModel = {
              _id: insertedId,
              title,
              description,
              teacherId,
              studentIds: [],
            };
            return formModelToCourse(courseModel!);    
        },


        updateStudent: async (_: unknown, { id, name, email }: { id: string, name?: string, email?: string }, context: {StudentCollection: Collection<Student> }): Promise<Student> => {
            const student = await context.StudentCollection.findOne({ _id: new ObjectId(id) });
            if (!student) throw new Error("Student not found");

            //comprueba si el valor es nulo, si lo es, se queda con el valor original
            const updateEmail = email ?? student.email;
            const updateName = name ?? student.name;

            const studentModel = await context.StudentCollection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name: updateName, email: updateEmail } });

            return formModelToStudent(studentModel!);
        },

        updateTeacher: async (_: unknown, { id, name, email }: { id: string, name?: string, email?: string }, context: {TeacherCollection: Collection<Teacher> }): Promise<Teacher> => {
            
            const teacher = await context.TeacherCollection.findOne({ _id: new ObjectId(id) });
            if (!teacher) throw new Error("Teacher not found");

            //comprueba si el valor es nulo, si lo es, se queda con el valor original
            const updateEmail = email ?? teacher.email;
            const updateName = name ?? teacher.name;

            const teacherModel = await context.TeacherCollection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name: updateName, email: updateEmail } });

            return formModelToTeacher(teacherModel!);
        },

        updateCourse: async (_: unknown, { id, title, description, teacherId }: { id: string, title?: string, description?: string, teacherId?: string }, context: {CourseCollection: Collection<Course> }): Promise<Course> => {
            const course = await context.CourseCollection.findOne({ _id: new ObjectId(id) });
            if (!course) throw new Error("Course not found");

            //comprueba si el valor es nulo, si lo es, se queda con el valor original
            const updateTitle = title ?? course.title;
            const updateDescription = description ?? course.description;
            const updateTeacherId = teacherId ?? course.teacherId;

            const courseModel = await context.CourseCollection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { title: updateTitle, description: updateDescription, teacherId: updateTeacherId } });

            return formModelToCourse(courseModel!);
        },


        deleteStudent: async (_: unknown, args: { id: string }, context: {StudentCollection: Collection<Student> }): Promise<boolean> => {
            const id = args.id;
            const studentModel = await context.StudentCollection.findOneAndDelete({_id: new ObjectId(id)});
            if (!studentModel) return false;
            return true;
        },

        deleteTeacher: async (_: unknown, args: { id: string }, context: {TeacherCollection: Collection<Teacher> }): Promise<boolean> => {
            const id = args.id;
            const teacherModel = await context.TeacherCollection.findOneAndDelete({_id: new ObjectId(id)});
            if (!teacherModel) return false;
            return true;
        },

        deleteCourse: async (_: unknown, args: { id: string }, context: {CourseCollection: Collection<Course> }): Promise<boolean> => {
            const id = args.id;
            const courseModel = await context.CourseCollection.findOneAndDelete({_id: new ObjectId(id)});
            if (!courseModel) return false;
            return true;
        },
    },
  };