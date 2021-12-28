'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

void async function () {
	try {
        const issueUrl = github.context.payload.issue.url;
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
			let response = await octokit.rest.projects.listCards({
				column_id: 17334784,
				archived_state: "not_archived",
				per_page: 100,
				page: page
			});
			let cards = response.data;
			if (cards.length == 0) {
				break;
			}
			let matches = cards.filter(card => card.content_url === issueUrl);
			if(matches.length > 0) {
				issueCard = matches[0];
			} else {
				page++;
			}
		}
		console.log('founds: ' + JSON.stringify(issueCard))
		// await octokit.rest.projects.createCard(request);
	} catch (error) {
		core.setFailed(error.message);
	}
}();
