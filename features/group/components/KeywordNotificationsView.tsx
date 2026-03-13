"use client";

import { Trash2Icon } from "lucide-react";

import type {
	KeywordNotificationsActions,
	KeywordNotificationsState,
} from "@/features/group/hooks/useKeywordNotifications";

import HorizontalPaddingBox from "@/shared/components/layout/HorizontalPaddingBox";
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/ui/input-field";
import { Spinner } from "@/shared/components/ui/spinner";
import { Typography } from "@/shared/components/ui/typography";

import { formatRelativeTimeLabel } from "@/shared/lib/format";

interface KeywordNotificationsViewProps {
	state: KeywordNotificationsState;
	actions: KeywordNotificationsActions;
	labels: {
		title: string;
		inputPlaceholder: string;
		inputGuide: string;
		inputLengthError: string;
		addButton: string;
		empty: string;
		listTitle: string;
		deleteAction: string;
	};
}

function KeywordNotificationsView(props: KeywordNotificationsViewProps) {
	const { state, actions, labels } = props;

	return (
		<section className="flex flex-1 flex-col overflow-y-scroll no-scrollbar">
			<HorizontalPaddingBox className="py-6">
				<div className="">
					<div className="flex flex-col gap-4">
						<div className="flex items-start gap-2">
							<div className="min-w-0 flex-1">
								<InputField
									value={state.keywordInput}
									onChange={(event) => actions.changeKeywordInput(event.target.value)}
									placeholder={labels.inputPlaceholder}
									clearable
									maxLength={30}
									groupClassName="h-11"
									disabled={state.isCreating}
								/>
								{state.keywordError && (
									<Typography type="caption" className="mt-1 block text-destructive">
										{state.keywordError}
									</Typography>
								)}
							</div>
							<Button
								size="xl"
								type="submit"
								className="h-11"
								disabled={state.isCreating}
								onClick={actions.submitKeyword}
							>
								{labels.addButton}
							</Button>
						</div>
					</div>
				</div>
			</HorizontalPaddingBox>

			<div className="flex flex-1 flex-col gap-3 py-5">
				{state.isLoading ? <Spinner /> : null}
				{!state.isLoading && state.subscriptions.length === 0 ? (
					<div className="flex items-center justify-center text-center">
						<Typography type="body-sm" className="text-muted-foreground whitespace-pre-wrap">
							{labels.empty}
						</Typography>
					</div>
				) : null}
				{state.subscriptions.length > 0 ? (
					<ul className="flex flex-col ">
						{state.subscriptions.map((subscription) => (
							<li key={subscription.keywordSubscriptionId}>
								<div className="flex items-center gap-3 px-4 py-3 border-b">
									<div className="min-w-0 flex-1">
										<Typography type="body-sm" className="font-semibold">
											{subscription.keyword}
										</Typography>
										<Typography type="caption" className="mt-1 block text-muted-foreground">
											{formatRelativeTimeLabel(subscription.createdAt)}
										</Typography>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="shrink-0 hover:bg-transparent hover:text-destructive hover:bg-none"
										disabled={state.isDeleting}
										onClick={() => actions.deleteKeyword(subscription.keywordSubscriptionId)}
									>
										<Trash2Icon className="size-4 " />
									</Button>
								</div>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</section>
	);
}

export { KeywordNotificationsView };
export type { KeywordNotificationsViewProps };
