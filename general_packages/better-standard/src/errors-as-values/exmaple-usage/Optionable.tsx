import type { Optionable } from "../rust-like-pattern/option";
import type { ConcreteResult } from "../rust-like-pattern/result";

/*

this is more of an example of how to use multiple of the types in tanthem but it still shows how to use the optional type

*/

type WebRequest<RequestResponse> = Optionable<ConcreteResult<RequestResponse>>;

// function useCustomFetchHook<RequestResponseType>(fetchData: () => Promise<RequestResponseType>): WebRequest<RequestResponseType> {
//     const [ data, setData ] = useState<WebRequest<RequestResponseType>>(new Optionable(new ConcreteResult<RequestResponseType>(new Optionable<RequestResponseType>(null), new Optionable(new CustomError("still loading ")))))
//     useEffect(() => {
//         const executeFetch = async () => { return await fetchData() }

//         executeFetch()
//             .then((r) => {
//                 setData(new Optionable(new Result(new Optionable(r), new Optionable<{}>(new Optionable<{}>(null))))
//             })
//             .catch((err) => {
//                 setData(new Optionable(new Result(new Optionable<RequestResponseType>(null), new Optionable(err))))
//             })

//     },[])

//     return data
// }

// function ReactComponent() {
//     const userData = useCustomFetchHook(() => {
//         return axios.get <{user: string}>("https://api.example.com/users")
//    })

//     try {
//         userData.unpack()
//     } catch (err) {

//    }

//     return (
//         <div>
//             {
//                 userData.unpack().unpack().data.user
//             }
//         </div>
//     )
// }
