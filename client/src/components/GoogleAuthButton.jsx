import { useEffect, useRef, useState } from "react";
import { getAuthErrorMessage, postWithWakeRetry, REQUEST_TIMEOUTS } from "../api/axios";
import { storeAuthData } from "../utils/auth";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function GoogleAuthButton({ label = "Continue with Google", onAuthenticated, onSuccess, onError }) {
    const buttonRef = useRef(null);
    const [ready, setReady] = useState(false);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return;

        const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

        if (window.google?.accounts?.id) {
            const timer = window.setTimeout(() => setReady(true), 0);

            return () => window.clearTimeout(timer);
        }

        const script = existingScript || document.createElement("script");
        script.src = GOOGLE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => setReady(true);
        script.onerror = () => onError?.("Google Sign-In failed to load.");

        if (!existingScript) {
            document.body.appendChild(script);
        }
    }, [clientId, onError]);

    useEffect(() => {
        if (!ready || !clientId || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            // Google Identity Services returns only an ID token for basic profile/email auth.
            // The backend verifies this token and we do not request Gmail, Drive, or Calendar scopes.
            callback: async (response) => {
                try {
                    const result = await postWithWakeRetry("/auth/google", {
                        credential: response.credential
                    }, {
                        timeout: REQUEST_TIMEOUTS.auth
                    });

                    if (onAuthenticated) {
                        onAuthenticated(result.data);
                    } else {
                        storeAuthData(result.data);
                    }

                    onSuccess?.();
                } catch (error) {
                    onError?.(
                        await getAuthErrorMessage(error, "Google login failed. Please try again.")
                    );
                }
            }
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: buttonRef.current.offsetWidth || 320
        });
    }, [clientId, onAuthenticated, onError, onSuccess, ready]);

    if (!clientId) {
        return (
            <div className="google-auth-config-note">
                Add <strong>VITE_GOOGLE_CLIENT_ID</strong> to your frontend environment
                and restart the dev server to enable Google Sign-In.
            </div>
        );
    }

    return (
        <div className="google-auth-wrap" aria-label={label}>
            <div ref={buttonRef}></div>
        </div>
    );
}

export default GoogleAuthButton;
