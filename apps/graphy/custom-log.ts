export async function Log(msg: string): Promise<void> {
fetch('http://localhost:5566/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: msg+"koko" 
})
  .then(response => response.text())
  .then(console.log)
  .catch(console.error);

}