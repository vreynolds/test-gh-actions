'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

void async function () {
	try {
        const issueUrl = github.context.payload.issue.url;
		console.log("context issue: " + github.context.payload.issue);
		// project - 13957392
		// triawge - 17334783
		// ice - 17334784
		// const {eventName, payload} = github.context;
		// const request = projects.createRequest(eventName, payload);
		const accessToken = core.getInput('ghprojects-token');
		const octokit = github.getOctokit(accessToken);
		let page = 1;
		let issueCard;
		while (!issueCard) {
			console.log('looking at page: ' + page)
			let response = await octokit.rest.projects.listCards({
				column_id: 17334784,
				archived_state: "not_archived",
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
