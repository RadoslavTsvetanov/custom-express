type obeecty<T> = {
    g: T
}



function h<T extends obeecty<unknown>, V extends T>(g: V) {
    return g 
}



