
export const schema = `#graphql

type Student {
    id: ID!
    name: String!
    email: String!
    enrolledCourses: [Course!]!
}

type Teacher {
    id: ID!
    name: String!
    email: String!
    courses: [Course!]!
}

type Course {
    id: ID!
    title: String!
    description: String!
    teacher: Teacher!
    students: [Student!]!
}

type Query {
    students: [Student!]!
    student(id: ID!): Student
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
    courses: [Course!]!
    course(id: ID!): Course
}
  
type Mutation {
    # Crear entidades
    createStudent(name: String!, email: String!): Student!
    createTeacher(name: String!, email: String!): Teacher!
    createCourse(title: String!, description: String!, teacherId: ID!): Course!
    
    # Actualizar entidades
    updateStudent(id: ID!, name: String, email: String): Student
    updateTeacher(id: ID!, name: String, email: String): Teacher
    updateCourse(id: ID!, title: String, description: String, teacherId: ID): Course
    
    # Añadir un estudiante a un curso (matricularlo)
    enrollStudentInCourse(studentId: ID!, courseId: ID!): Course
    removeStudentFromCourse(studentId: ID!, courseId: ID!): Course
   
    # Eliminar entidades
    deleteStudent(id: ID!): Boolean!
    deleteTeacher(id: ID!): Boolean!
    deleteCourse(id: ID!): Boolean!
    
}`;