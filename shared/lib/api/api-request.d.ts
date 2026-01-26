declare global {
	namespace Api {
		namespace Request {
			interface Login {
				loginId: string;
				password: string;
			}

			interface Signup {
				loginId: string;
				password: string;
			}
		}
	}
}

export {};
