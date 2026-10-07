import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUsername, createModerator, createUser } from "../services/register.service";
import { login } from "../services/login.service";
import { getAllUsers } from "../services/user.service";

export default function Login() {
	const loginInfo = {
		username: "",
		password: "",
		role: ""
	};

	const registerInfo = {
		username: "",
		password: "",
		name: "",
		email: ""
	};

	const navigate = useNavigate();

	const [loginForm, setLoginForm] = useState(loginInfo);
	const [registerForm, setRegisterForm] = useState(registerInfo);

	const [isModerator, setIsModerator] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);

	const handleChange = (e) => {
		if (isRegistering) {
			setRegisterForm((prev) => ({
				...prev,
				[e.target.name]: e.target.value
			}));
		} else {
			setLoginForm((prev) => ({
				...prev,
				[e.target.name]: e.target.value
			}));
		}
	};

	const clearLoginForm = () => setLoginForm(loginInfo);
	const clearRegisterForm = () => setRegisterForm(registerInfo);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Register
		if (isRegistering) {
			const checkUsernameRes = await checkUsername(registerForm.username);
			const isUsernameAvailable = checkUsernameRes.data;
			if (!isUsernameAvailable) {
				alert("This username is already taken. Please choose another one.");
				return;
			}

			if (isModerator) {
				await createModerator({
					username: registerForm.username,
					password: registerForm.password
				});
			} else {
				await createUser(registerForm);
			}
			console.log("Registered!");
			alert("Account created!");
			clearRegisterForm();
			setIsRegistering(!isRegistering);
		} else {
			// Login
			const role = isModerator ? "MODERATOR" : "USER";
			const payload = { ...loginForm, role: role };
			try {
				const response = await login(payload);
				const user = response.data;

				localStorage.setItem("user", JSON.stringify(user));
				console.log("Login!");
				alert("Login successful!");
				clearLoginForm();
				navigate("/");
			} catch (error) {
				if (error.response?.status === 401) {
					alert(error.response.data);
				}
			}
		}
	};

	return (
		<div className="flex justify-center pt-12 px-4">
			<div className="card w-full max-w-sm bg-gray-50 shadow-xl border border-base-200">
				<form onSubmit={handleSubmit} className="card-body gap-3">
					{/* Form Header Title */}
					<h2 className="card-title justify-center text-2xl font-bold mb-1">
						{isRegistering
							? isModerator
								? "Create Moderator Account"
								: "Create User Account"
							: isModerator
								? "Moderator Login"
								: "User Login"}
					</h2>

					{/* Registration-Only Fields: Name & Email */}
					{isRegistering && !isModerator && (
						<>
							<fieldset className="fieldset">
								<legend className="fieldset-legend">Name</legend>
								<input
									name="name"
									value={registerForm.name}
									onChange={handleChange}
									placeholder="Enter your name"
									className="input input-bordered w-full"
									minLength={2}
									maxLength={50}
									pattern="[A-Za-z ]+"
									title="Username must contain only letters and spaces"
									required
								/>
							</fieldset>

							<fieldset className="fieldset">
								<legend className="fieldset-legend">Email</legend>
								<input
									name="email"
									type="email"
									value={registerForm.email}
									onChange={handleChange}
									placeholder="Enter email"
									className="input input-bordered w-full"
									required
								/>
							</fieldset>
						</>
					)}

					{/* Common Fields: Username & Password */}
					<fieldset className="fieldset">
						<legend className="fieldset-legend">Username</legend>
						<input
							name="username"
							value={isRegistering ? registerForm.username : loginForm.username}
							onChange={handleChange}
							placeholder="Enter username"
							className="input input-bordered w-full"
							pattern="[A-Za-z0-9_]+"
							minLength={3}
							maxLength={30}
							title="Username must contain only letters, numbers, and underscores"
							required
						/>
					</fieldset>

					<fieldset className="fieldset">
						<legend className="fieldset-legend">Password</legend>
						<input
							name="password"
							type="password"
							value={isRegistering ? registerForm.password : loginForm.password}
							onChange={handleChange}
							placeholder="Enter password"
							className="input input-bordered w-full"
							minLength={8}
							maxLength={30}
							title="Password must be at least 8 characters"
							required
						/>
					</fieldset>

					<div className="flex justify-between items-center mt-2">
						{!isRegistering ? (
							<button
								type="button"
								className="btn btn-info btn-sm"
								onClick={() => {
									setIsModerator(!isModerator);
									clearLoginForm();
								}}
							>
								Switch to {isModerator ? "User" : "Moderator"}
							</button>
						) : (
							<div />
						)}

						<button type="submit" className="btn btn-success text-black px-6">
							{isRegistering ? "Register" : "Login"}
						</button>
					</div>

					<div className="divider my-1">OR</div>

					{/* Toggle Login / Register */}
					<div className="text-center text-sm">
						{isRegistering ? (
							<span>
								Already have an account?{" "}
								<button
									type="button"
									className="link link-primary font-semibold"
									onClick={() => {
										setIsRegistering(false);
										clearRegisterForm();
									}}
								>
									Log in
								</button>
							</span>
						) : (
							<span>
								Don't have an account?{" "}
								<button
									type="button"
									className="link link-primary font-semibold"
									onClick={() => {
										setIsRegistering(true);
										clearLoginForm();
									}}
								>
									Create {isModerator ? "Moderator" : "User"} Account
								</button>
							</span>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
