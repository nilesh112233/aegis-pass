import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { InfoIcon } from "lucide-react";

export default function Notification() {
    return (
        <Alert>
            <InfoIcon />
            <AlertTitle>Welcome to the Aegis-Pass</AlertTitle>
            <AlertDescription>
                <span>This app was built as a learning and educational project by the developer.</span> 
                
                <span>While the app is functional, there may still be unknown bugs, security issues, or unexpected behavior.</span>

                <span>Please do not store highly sensitive information.</span>

                <span>Use this app at your own discretion and preferably for testing or non-critical accounts only.</span>

                <span>Thank you for trying the project and helping support the learning journey behind it.</span>
            </AlertDescription>
        </Alert>
    )
}