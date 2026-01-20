import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/LoginForm";

function LoginPage() {
	return (
		<>
			<div className="space-y-1 mx-auto">
				<h1 className="text-2xl font-semibold">로그인</h1>
			</div>
			<Suspense>
				<LoginForm />
			</Suspense>
		</>
	);
}

export default LoginPage;
