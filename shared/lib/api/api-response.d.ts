declare global {
	namespace Api {
		namespace Response {
			interface Login {
				accessToken: string;
				userId: number;
			}

			interface Signup {
				userId: number;
				nickname: string;
			}
		}
	}
}

export {};
