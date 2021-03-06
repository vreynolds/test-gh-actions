'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

void async function () {
	try {
        const issueUrl = github.context.payload.issue.url;
		const issueOpen = github.context.payload.issue.state === "open";
		const closedAt = github.context.payload.issue.closed_at;
		if (!issueOpen) {
			let now = new Date();
			let closedTime = new Date(closedAt);
			let closedMinutesAgo = (now - closedTime)/60000;
			if (closedMinutesAgo < 3) {
				console.log('likely a closing comment, bailing');
				return;
			}
		}
		console.log("context issue: " + JSON.stringify(github.context.payload.issue));
		// project - 13957392
		// triawge - 17334783
		// ice - 17334784
		// done - 17340452
		const accessToken = core.getInput('ghprojects-token');
		const octokit = github.getOctokit(accessToken);
		let page = 1;
		let issueCard;
		while (!issueCard) {
			console.log('looking at page: ' + page)
			let response = await octokit.rest.projects.listCards({
				column_id: issueOpen ? 17334784 : 17340452,
				archived_state: issueOpen ? "not_archived" : "all",
				per_page: 100,
				page: page
			});
			let cards = response.data;
			console.log('got cards: ' + JSON.stringify(cards))
			if (cards.length == 0) {
				console.log('no cards, breaking')
				break;
			}
			let matches = cards.filter(card => card.content_url === issueUrl);
			console.log('filtered matches: ' + JSON.stringify(matches))
			if(matches.length > 0) {
				issueCard = matches[0];
			} else {
				page++;
			}
		}
		console.log('end issue card: ' + JSON.stringify(issueCard))
		if(issueCard) {
			if(!issueOpen) {
				await octokit.rest.projects.updateCard({
					card_id: issueCard.id,
					archived: false
				});
			}
			await octokit.rest.projects.moveCard({
				card_id: issueCard.id,
				column_id: 17334783,
				position: "bottom"
			});
		}
		// await octokit.rest.projects.createCard(request);
	} catch (error) {
		core.setFailed(error.message);
	}
}();
