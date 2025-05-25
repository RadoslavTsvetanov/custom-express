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