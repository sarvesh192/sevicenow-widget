import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import {actionTypes} from '@servicenow/ui-core';

const view = (state, {updateState}) => {
	const {
		activeTab,
		activeSections,
		summaryContent,
		aiAnswer,
		knowledgeContent,
		isIframeVisible,
		isSummaryReady,
		isAIanswerReady,
		isKnowledgeReady,
		isModalOpen,
		modalText,
		modalHeading,
		logoUrl,
		widgetHeading,
		buttonHeading,
		isApiCallInProgress,
		showFooter
	} = state;

	return (
		<div className="container">
			<div className="card-container">
				{/* Header Card */}
				<div className="header-card">
					<div className="header-content">
						<div className="logo-section">
							<img src={logoUrl || "enjo-logo.png"} alt="Enjo Logo" className="logo-class"/>
							<span className="heading">{widgetHeading || "Enjo Assistant"}</span>
						</div>
						<div className="button-section">
							<button className="btn btn-primary" 
								on-click={() => updateState({isIframeVisible: !isIframeVisible})}
								disabled={isApiCallInProgress}>
								{isIframeVisible ? 'Close' : (buttonHeading || 'Ask Enjo')}
							</button>
						</div>
					</div>
				</div>

				{/* Tabs Container */}
				{isIframeVisible && (
					<div className="tabs-container">
						<div className="tabs-header">
							<div className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
								on-click={() => updateState({activeTab: 'chat'})}>
								Chat
							</div>
							<div className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
								on-click={() => updateState({activeTab: 'recommendations'})}>
								Recommendations
							</div>
						</div>

						{/* Tab Content */}
						<div className="tab-content">
							{activeTab === 'chat' && (
								<div className="chat-container">
									<iframe src={state.chatUrl} className="chat-frame"/>
								</div>
							)}

							{activeTab === 'recommendations' && (
								<div className="recommendations-container">
									<div className="accordion">
										{/* Case Summary Section */}
										<div className="accordion-section">
											<div className="accordion-header"
												on-click={() => updateState({
													activeSections: activeSections.includes('summary') 
														? activeSections.filter(s => s !== 'summary')
														: [...activeSections, 'summary']
												})}>
												Case Summary
											</div>
											{activeSections.includes('summary') && (
												<div className="accordion-content">
													<div className="content-area">
														{!isSummaryReady && <div className="spinner"/>}
														<div className="text-content">{summaryContent}</div>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateSummary()}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copySummary()}>
																📋
															</button>
														</div>
													</div>
												</div>
											)}
										</div>

										{/* AI Answer Section */}
										<div className="accordion-section">
											<div className="accordion-header"
												on-click={() => updateState({
													activeSections: activeSections.includes('aiAnswer') 
														? activeSections.filter(s => s !== 'aiAnswer')
														: [...activeSections, 'aiAnswer']
												})}>
												AI Answer
											</div>
											{activeSections.includes('aiAnswer') && (
												<div className="accordion-content">
													<div className="content-area">
														{!isAIanswerReady && <div className="spinner"/>}
														<div className="text-content">{aiAnswer}</div>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateAiAnswer()}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copyAiAnswer()}>
																📋
															</button>
														</div>
													</div>
												</div>
											)}
										</div>

										{/* KB Generation Section */}
										<div className="accordion-section">
											<div className="accordion-header"
												on-click={() => updateState({
													activeSections: activeSections.includes('kb') 
														? activeSections.filter(s => s !== 'kb')
														: [...activeSections, 'kb']
												})}>
												KB Generation
											</div>
											{activeSections.includes('kb') && (
												<div className="accordion-content">
													<div className="content-area">
														<div className="kb-header">
															<span className="help-text">Click only when a case is closed</span>
															<button className="btn btn-secondary"
																on-click={() => generateKnowledge()}
																disabled={isKnowledgeReady}>
																Generate
															</button>
														</div>
														{!isKnowledgeReady && <div className="spinner"/>}
														<div className="text-content">{knowledgeContent}</div>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateKnowledge()}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copyKnowledge()}>
																📋
															</button>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Footer */}
				{showFooter && (
					<div className="footer">
						<span>Powered by</span>
						
						<a href="https://enjo.ai" target="_blank"><img src={logoUrl} alt="Enjo" /></a>
					</div>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="modal">
					<div className="modal-content">
						<h2>{modalHeading}</h2>
						<p>{modalText}</p>
						<button on-click={() => updateState({isModalOpen: false})}>Close</button>
					</div>
				</div>
			)}
		</div>
	);
};

const urls = {
	development: "https://api.dev.app.enjo.ai",
	staging: "https://stage.app.enjo.ai",
	production: "https://api.app.enjo.ai",
	local: "https://7874-49-156-105-215.ngrok-free.app"
};

const baseUrl = urls['local']
const hostname = window.location.hostname;
const protocol = window.location.protocol;

const servicenowDomain = `${protocol}//${hostname}`
// const servicenowDomain = `https://dev240445.service-now.com`
const agentConfigUrl = `${baseUrl}/api/widget/app.servicenow.webchat.agentConfig?isSalesforce=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}`

createCustomElement('x-1578569-enjo-test', {
	renderer: {type: snabbdom},
	view,
	styles,
	initialState: {
		activeTab: 'recommendations',
		activeSections: [],
		isIframeVisible: false,
		isSummaryReady: true,
		isAIanswerReady: true,
		isKnowledgeReady: true,
		summaryContent: '',
		aiAnswer: '',
		knowledgeContent: '',
		recordId: '',
		isModalOpen: false,
		modalText: '',
		modalHeading: '',
		widgetHeading: 'Enjo Assistant',
		buttonHeading: 'Ask Enjo',
		logoUrl: '',
		isApiCallInProgress: false,
		showFooter: true,
		chatUrl: "",
	},
	actionHandlers: {
		[actionTypes.COMPONENT_CONNECTED]: async ({state, updateState, dispatch}) => {
			dispatch('FETCH_CASE_DATA')
			let url = window.location.pathname;
			const reg = new RegExp(/^[a-f0-9]{32}$/);
			let incidentId = "";
			url.split('/').forEach((data) => {
				if(data.match(reg)) {
					incidentId = data;
				}
			})
			const res = await fetch(agentConfigUrl, {
				method: 'GET',
				headers: {
					"ngrok-skip-browser-warning": "69420"
				}
			})
			const response = await res.json()

			updateState({
				recordId: incidentId,
				logoUrl: response?.data?.logoUrl || 'https://app.enjo.ai/enjologo.svg',
				widgetHeading: response?.data?.header || widgetHeading,
				buttonHeading: response?.data?.buttonHeading || buttonHeading,
				showFooter: response?.data?.showEnjoBranding
			})
		},
		'FETCH_CASE_DATA': createHttpEffect('/api/now/table/sys_journal_field', {
			method: 'GET',
			queryParams: {
				sysparm_query: `element_id=8c82b043835a121036b4a230ceaad3f8^element=comments^ORDERBYDESCsys_created_on`,
				sysparm_display_value: true
			},
			successActionType: 'FETCH_CASE_DATA_SUCCESS'
		}),
		'FETCH_CASE_DATA_SUCCESS': ({action, updateState, state}) => {
			const conversations = action.payload.result.filter((data) => data.element_id == "8c82b043835a121036b4a230ceaad3f8");
			console.log('conversations', action)
			updateState({
				summaryContent: conversations
					.map(conv => `${conv.value}`) 
					.join('\n\n')
			});
		},
		
		
	}
});
