import { ClassicalEither, Either, LeftInstance, LeftRight, LeftRightWithMemory, RightInstance } from "../rust-like-pattern/leftRight";
import type { Validator } from "../utils/validator";

function getAdmin(username: string): LeftRightWithMemory<{isAdmin: boolean}, {key: string}> {
    if (username.length === 3) {
        return new LeftRightWithMemory<{isAdmin: boolean}, {key: string}>({ isAdmin: true }, { key: "" },(v) => v.isAdmin === true)
    }
    return new LeftRightWithMemory<{isAdmin: boolean}, {key: string}>({ isAdmin: false }, { key: "" },(v) => v.isAdmin === true)
}



async function validateUser(username: string) {
    const res =await  getAdmin(username).handleLeft(async (v) => {
        // ... 
    })
    res.handleRight(async (v) => { 
        // ...
    })
}


validateUser("use") // only prints "admin logged in"
validateUser("i") // only prints "regular user logged in"





// Example 1: User Authentication Response Handler
interface UserData {
    id: string;
    name: string;
    email: string;
}

interface AuthError {
    code: number;
    message: string;
}

async function handleAuthenticationResponse() {
    // Simulate API authentication response
    const authResponse = new LeftRight<AuthError, UserData>(
        { code: 401, message: "Invalid credentials" },
        { id: "123", name: "John Doe", email: "john@example.com" }
    );

    // Handle both success and error cases
    await authResponse
        .handleLeft(async (error) => {
            // Log the error and show user-friendly message
            console.error(`Authentication failed: ${error.code}`);
            showUserMessage(`Login failed: ${error.message}`);
        }).then((v) => {
        v.handleRight(async (userData) => {
            // Store user session and redirect
            await sessionStorage.setItem('user', JSON.stringify(userData));
            redirectToDashboard();
        });
        })

}

// Example 2: Payment Processing with Either
interface PaymentSuccess {
    transactionId: string;
    amount: number;
    timestamp: Date;
}

interface PaymentFailure {
    errorCode: string;
    reason: string;
    retriable: boolean;
}

async function processPayment(amount: number) {
    // Simulate payment processing
    const isPaymentSuccessful = amount > 0 && Math.random() > 0.5;
    
    const paymentResult = new Either<PaymentFailure, PaymentSuccess>(
        { 
            errorCode: "INSUFFICIENT_FUNDS",
            reason: "Not enough balance",
            retriable: true
        },
        {
            transactionId: "tx_" + Math.random().toString(36),
            amount: amount,
            timestamp: new Date()
        },
        () => !isPaymentSuccessful
    );

    await paymentResult
        .handleLeft(async (failure) => {
            if (failure.retriable) {
                await scheduleRetry(amount);
            }
            await notifyUserOfFailure(failure.reason);
        }).then((v) => {

        v.handleRight(async (success) => {
            await sendReceiptEmail(success);
            await updateOrderStatus(success.transactionId);
        });
        })
}

// Example 3: File Upload with Progress Tracking using LeftRightWithMemory
interface UploadProgress {
    bytesUploaded: number;
    totalBytes: number;
    percentage: number;
}

interface UploadSuccess {
    fileUrl: string;
    fileSize: number;
    mimeType: string;
}

async function handleFileUpload(file: File) {
    const isUploadComplete: Validator<UploadProgress> = 
        (progress) => progress.percentage === 100;

    const uploadTracker = new LeftRightWithMemory<UploadProgress, UploadSuccess>(
        {
            bytesUploaded: 0,
            totalBytes: file.size,
            percentage: 0
        },
        {
            fileUrl: "https://example.com/files/uploaded.pdf",
            fileSize: file.size,
            mimeType: file.type
        },
        isUploadComplete
    );

    // Update progress bar while uploading
    await uploadTracker.handleLeft(async (progress) => {
        updateProgressBar(progress.percentage);
        if (progress.percentage < 100) {
            // Simulate chunk upload
            await uploadNextChunk(file);
        }
    });

    // Handle successful upload
    await uploadTracker.handleRight(async (success) => {
        await updateFileLibrary(success.fileUrl);
        showSuccessMessage(`File uploaded successfully: ${success.fileUrl}`);
    });
}

// Helper functions (implementation details omitted for brevity)
function showUserMessage(message: string) { /* ... */ }
function redirectToDashboard() { /* ... */ }
function scheduleRetry(amount: number) { /* ... */ }
function notifyUserOfFailure(reason: string) { /* ... */ }
function sendReceiptEmail(success: PaymentSuccess) { /* ... */ }
function updateOrderStatus(transactionId: string) { /* ... */ }
function updateProgressBar(percentage: number) { /* ... */ }
function uploadNextChunk(file: File) { /* ... */ }
function updateFileLibrary(fileUrl: string) { /* ... */ }
function showSuccessMessage(message: string) { /* ... */ }



// another very good example 
// suppose the getUser request can return two types of employees -> (Senior or junior) and we have to process their payment which is calulated by the foirmula (v) => {if v is Junior -> baseSalary * 1.5 if v is Senior -> base salary * 1.5 * years in the company}


type Senior = {
    years_in_the_company: number
    base_salary: number
}

type Junior = {
    base_salary:  number
}

function getUser(username: string): ClassicalEither<Senior, Junior> {
    if (username.length === 4) {
        return new ClassicalEither<Senior, Junior>(
            new LeftInstance<Senior>({ years_in_the_company: 5, base_salary: 1000 }),
        )
    }
    return new ClassicalEither<Senior, Junior>(new RightInstance<Junior>({ base_salary: 1000 }))
}


function PaySalary(username: string) {
    const user = getUser(username)
    user.handleLeft(async (v) => {
        // console.log("paying salary of",(v.base_salary * 2.5 * v.years_in_the_company).toString())
    }).handleRight(async (v) => {
        // console.log("paying salary of",(v.base_salary * 1.5))
    })

}


PaySalary("john")
PaySalary("popopo")






// ----------------------------------------------------------------


// examples of how to use Either 



// imagine having an app where you have a gallery with users and the only way to differenciate between users is to check if the user adminPhoto url is 4 chars long, there is no way you can do this using the type system so here you do this  
type GalleryAdmin = { adminPhoto: string }

class AdminOrNormalUser extends Either<GalleryAdmin,GalleryAdmin >{
    constructor(v: GalleryAdmin) {
        super(v, v, () => {
            if (v.adminPhoto.length === 5) {
               return true
           }
           return false
        })
    }
}





function processUser(user: AdminOrNormalUser) {
    user.handleLeft(async (v) => {
        // console.log("admin user:", v.adminPhoto)
    }).then(v => {
        v.handleRight(async (v) => {
        // console.log("normal user")
    })
    })
}


processUser(new AdminOrNormalUser({adminPhoto: "hhhh"}))
processUser(new AdminOrNormalUser({adminPhoto: "hhh"}))