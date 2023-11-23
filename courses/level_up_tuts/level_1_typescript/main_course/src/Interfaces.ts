export default interface Person {
    name: string,
    age?: number
    friends?: Person[]
}

export enum Type {
    Video,
    BlogPost,
    Quiz
}

export enum StringType {
    Video = "VIDEO",
    BlogPost = "BLOG_POST",
    Quiz = "QUIZ"
}