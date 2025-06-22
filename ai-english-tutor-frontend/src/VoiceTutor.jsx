import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const VoiceTutor = () => {
	const [transcript, setTranscript] = useState("");
	const [response, setResponse] = useState("");
	const [listening, setListening] = useState(false);
	const [error, setError] = useState("");
	const [isSupported, setIsSupported] = useState(false);
	const recognitionRef = useRef(null);

	const sendToBackend = async (text) => {
		try {
			console.log("Sending to backend:", text);
			const res = await axios.post("http://localhost:8080/api/tutor/converse", {
				message: text,
			});
			const reply = res.data;
			console.log("Backend response:", reply);
			setResponse(reply);
			speak(reply);
		} catch (err) {
			console.error("Backend error:", err);
			setResponse("Error from backend");
			setError("Failed to connect to backend");
		}
	};

	useEffect(() => {
		// Check if speech recognition is supported
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		// Detect Brave browser
		const isBrave = navigator.brave && navigator.brave.isBrave;

		if (!SpeechRecognition) {
			if (isBrave) {
				setError(
					"Speech recognition is blocked by Brave's privacy features. Please use Chrome, Safari, or Edge, or disable Brave's shields for this site."
				);
			} else {
				setError(
					"Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge."
				);
			}
			setIsSupported(false);
			return;
		}

		setIsSupported(true);

		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		recognition.continuous = false; // Set to false for single utterance

		recognitionRef.current = recognition;

		recognition.onstart = () => {
			console.log("Speech recognition started");
			setListening(true);
			setError("");
		};

		recognition.onresult = (event) => {
			console.log("Speech recognition result:", event);
			const text = event.results[0][0].transcript;
			console.log("Transcript:", text);
			setTranscript(text);
			sendToBackend(text);
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setListening(false);

			switch (event.error) {
				case "no-speech":
					setError("No speech detected. Please try again.");
					break;
				case "audio-capture":
					setError("Microphone not accessible. Please check permissions.");
					break;
				case "not-allowed":
					setError(
						"Microphone permission denied. Please allow microphone access."
					);
					break;
				case "network":
					setError("Network error occurred.");
					break;
				default:
					setError(`Speech recognition error: ${event.error}`);
			}
		};

		recognition.onend = () => {
			console.log("Speech recognition ended");
			setListening(false);
		};

		// Cleanup function
		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
		};
	}, []);

	const handleStart = () => {
		if (!isSupported) {
			setError("Speech recognition is not supported");
			return;
		}

		if (listening) {
			// Stop listening
			recognitionRef.current?.stop();
		} else {
			// Start listening
			setError("");
			setTranscript("");
			setResponse("");

			try {
				recognitionRef.current?.start();
			} catch (err) {
				console.error("Error starting recognition:", err);
				setError("Failed to start speech recognition");
				setListening(false);
			}
		}
	};

	const speak = (text) => {
		if ("speechSynthesis" in window) {
			// Stop any ongoing speech
			speechSynthesis.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = "en-US";
			utterance.rate = 0.8; // conversational speed
			utterance.pitch = 1.1; // Pitch
			utterance.volume = 0.9; // Volume

			const voices = speechSynthesis.getVoices();
			const preferredVoices = [
				"Samantha", // macOS
				"Google US English", // Chrome
				"Microsoft Zira", // Windows
				"Alex", // iOS
			];

			for (const voiceName of preferredVoices) {
				const voice = voices.find((v) => v.name.includes(voiceName));
				if (voice) {
					utterance.voice = voice;
					break;
				}
			}

			utterance.onstart = () => console.log("Speech synthesis started");
			utterance.onend = () => console.log("Speech synthesis ended");
			utterance.onerror = (event) =>
				console.error("Speech synthesis error:", event);

			speechSynthesis.speak(utterance);
		} else {
			console.warn("Speech synthesis not supported");
		}
	};

	if (!isSupported) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<h2>🎓 AI English Tutor</h2>
				<p style={{ color: "red" }}>
					Speech recognition is not supported in this browser. Please use
					Chrome, Safari, or Edge for the best experience.
				</p>
			</div>
		);
	}

	return (
		<div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
			<h2>🎓 AI English Tutor</h2>

			<button
				onClick={handleStart}
				style={{
					padding: "10px 20px",
					fontSize: "16px",
					backgroundColor: listening ? "#dc3545" : "#007bff",
					color: "white",
					border: "none",
					borderRadius: "5px",
					cursor: "pointer",
					marginBottom: "20px",
				}}
			>
				{listening ? "🎤 Listening... (Click to stop)" : "🎤 Start Speaking"}
			</button>

			{error && (
				<div
					style={{
						color: "red",
						backgroundColor: "#ffe6e6",
						padding: "10px",
						borderRadius: "5px",
						marginBottom: "20px",
					}}
				>
					<strong>Error:</strong> {error}
				</div>
			)}

			<div style={{ marginBottom: "15px" }}>
				<strong>You said:</strong>
				<p
					style={{
						backgroundColor: "#f8f9fa",
						padding: "10px",
						borderRadius: "5px",
						minHeight: "40px",
						fontStyle: transcript ? "normal" : "italic",
						color: transcript ? "black" : "#666",
					}}
				>
					{transcript || "Your speech will appear here..."}
				</p>
			</div>

			<div>
				<strong>AI says:</strong>
				<p
					style={{
						backgroundColor: "#e7f3ff",
						padding: "10px",
						borderRadius: "5px",
						minHeight: "40px",
						fontStyle: response ? "normal" : "italic",
						color: response ? "black" : "#666",
					}}
				>
					{response || "AI response will appear here..."}
				</p>
			</div>

			<div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
				<p>
					<strong>Instructions:</strong>
				</p>
				<ul style={{ textAlign: "left" }}>
					<li>Click "Start Speaking" and speak clearly</li>
					<li>The AI will respond with corrections and suggestions</li>
					<li>Make sure your microphone is enabled</li>
				</ul>
			</div>
		</div>
	);
};

export default VoiceTutor;
