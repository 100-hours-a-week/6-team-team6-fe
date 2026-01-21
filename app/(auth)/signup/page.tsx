import { Suspense } from "react";

import SignupForm from "@/features/auth/components/SignupForm";

function SignupPage() {
	return (
		<>
			<div className="space-y-1 mx-auto">
				<h1 className="text-2xl font-semibold">회원가입</h1>
			</div>
			<Suspense>
				<SignupForm />
			</Suspense>
		</>
	);
}

export default SignupPage;
