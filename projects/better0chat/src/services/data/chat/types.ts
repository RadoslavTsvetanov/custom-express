export type ProjectID = string;

export type Message = {
    isUser: boolean;
    message: string[];
};

export type Chat = {
    project: ProjectID;
    messages: Message[];
};

export type Project = {
    chats: Chat[];
    projects: Project[];
};

export type ChatService = {
    getChats: Chat[];
    getProjects: Project[];
};
