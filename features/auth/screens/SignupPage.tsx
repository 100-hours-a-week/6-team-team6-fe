import AuthRedirectGuard from "@/features/auth/components/AuthRedirectGuard";
import SignupForm from "@/features/auth/components/SignupForm";

export function SignupPage() {
	return (
		<>
			<AuthRedirectGuard />
			<div className="space-y-1 mx-auto">
				<h1 className="text-2xl font-semibold">회원가입</h1>
			</div>
			<SignupForm />
		</>
	);
}
