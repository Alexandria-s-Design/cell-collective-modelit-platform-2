import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import styles from "./style.module.css";
import request from "../../../request";
import Application from "../../../application";
import store from "store";
import { history } from '../../../store';

const IS_DEVELOPMENT = import.meta.env.MODE == "development";

const Landing = () => {
		const location = useLocation();
    const [lessonCode, setLessonCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

		useEffect(() => {
			const pathName = location.pathname.split("/").filter(Boolean).pop();
			if (!IS_DEVELOPMENT
					&& ['learn','teach'].includes(Application.currSubdomain) === false
					&& pathName !== 'login') {
				window.location.href = import.meta.env.VITE_CC_URL_LEARN;
			}
		}, []);

    const handleLessonCodeChange = (event) => {
        setLessonCode(event.target.value);
        setError(""); // Clear error when user types
    }

    const handleEnter = async () => {
        if (lessonCode.trim()) {
            setIsLoading(true);
            setError("");
            
						store.set("application_domain", "learning");

            try {
                const response = await request.post(`/api/module/modelit/${lessonCode.trim()}`);
								
								if (IS_DEVELOPMENT) {
									store.set("application_hostname", window.location.hostname);
								}

                if (response.data && response.data.status === "success") {
										// urls.sign_in, urls.redirect_to, anonymousUser.temp_email, anonymousUser.temp_password
										const { anonymousUser, urls } = response.data.data;
										let redirectTo = `/dashboard?auth=anonymous-user&type=modelit&email=${anonymousUser.temp_email}&token=${anonymousUser.temp_password}&redirect=${urls.redirect_hash}`;
										history.push(redirectTo);
                } else {
                    setError("Invalid lesson code. Please check and try again.");
                }
            } catch (error) {
                console.error('Error validating lesson code:', error);
                if (error.response && error.response.status === 404) {
                    setError("Lesson code not found. Please check and try again.");
                } else if (error.response && error.response.status === 400) {
										if ('error' in error.response.data && 'errors' in error.response.data.error) {
											setError(error.response.data.error.errors[0].message);
										} else {
											setError("Invalid lesson code format. Please check and try again.");
										}                    
                } else {
                    setError("Failed to validate lesson code. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleEnter();
        }
    }

    return (
        <div className={styles.landingNew}>
            <div className={styles.landingContainer}>
                {/* ModelIt! Logo */}
                <div className={styles.logoContainer}>
                    <img 
                        src="/assets/images/logo/research/logo.png" 
                        alt="ModelIt! Logo" 
                        className={styles.mainLogo}
                    />
                </div>

                {/* Input Form Container */}
                <div className={styles.formContainer}>
                    <input
                        type="text"
                        className={styles.lessonCodeInput}
                        placeholder="Lesson Code"
                        value={lessonCode}
                        onChange={handleLessonCodeChange}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button 
                        className={styles.enterButton}
                        onClick={handleEnter}
                        disabled={isLoading || !lessonCode.trim()}
                    >
                        {isLoading ? "Validating..." : "Enter"}
                    </button>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Landing
