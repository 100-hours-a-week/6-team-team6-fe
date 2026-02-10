import AuthRedirectGuard from "@/features/auth/components/AuthRedirectGuard";
import LoginForm from "@/features/auth/components/LoginForm";

export function LoginPage() {
	return (
		<>
			<AuthRedirectGuard />
			<div className="space-y-1 mx-auto">
				<h1 className="text-2xl font-semibold">로그인</h1>
			</div>
			<LoginForm />
		</>
	);
}
