export type ProjectID = string

export type Message = {
    isUser: boolean,
    message: string[]
}

export interface Chat {
    project: ProjectID
    messages: Message[]
}

export interface Project {
    chats: Chat[]
    projects: Project[]
}

export interface ChatService {
    getChats: Chat[]
    getProjects: Project[]
}


function g<T,R, FirstReturn, SecondReturn>(v: R | T, g: {
    first: (v: R) => FirstReturn,
    second: (v: T) => SecondReturn
}){

}
