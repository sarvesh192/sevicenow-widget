import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import {actionTypes} from '@servicenow/ui-core';
import '@servicenow/now-rich-text'
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
														<now-rich-text html={summaryContent}></now-rich-text>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateCaseSummaryHandler(state, updateState)}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copyHandler(state.summaryContent)}>
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
														<now-rich-text html={aiAnswer}></now-rich-text>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateAiAnswerHandler(state, updateState)}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copyHandler(state.aiAnswer)}>
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
																on-click={() => generateKnowledgeHandler(state, updateState)} 
																>
																Generate
															</button>
														</div>
														{!isKnowledgeReady && <div className="spinner"/>}
														<now-rich-text html={knowledgeContent}></now-rich-text>
														<div className="action-buttons">
															<button className="btn-icon refresh"
																on-click={() => generateKnowledge()}>
																↻
															</button>
															<button className="btn-icon copy"
																on-click={() => copyHandler(state.knowledgeContent)}>
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
	local: "http://localhost:4001"
};

const baseUrl = urls['local']
const hostname = window.location.hostname;
const protocol = window.location.protocol;

// const servicenowDomain = `${protocol}//${hostname}`
const servicenowDomain = `https://dev240445.service-now.com`
const agentConfigUrl = `${baseUrl}/api/widget/app.servicenow.webchat.agentConfig?isServicenow=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}`

const copyHandler = (content) => {
	const parser = new DOMParser();
	const html = parser.parseFromString(content, 'text/html');
	const text = html.body.innerText || html.body.textContent;

	navigator.clipboard.writeText(text)
	.then(() => {

	})
	.catch((err) => {
		console.log('Error in copying:', error)
	}) 
}

const generateKnowledge = async ({state, updateState}) => {
	const knowledgeUrl = `${baseUrl}/api/widget/app.servicenow.webchat.generateKnowledge?isServicenow=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}`;
	updateState({isKnowledgeReady: false});
	try {
	  const res = await fetch(`${knowledgeUrl}&incidentId=${state.recordId || '8c82b043835a121036b4a230ceaad3f8'}`, {
		method: 'GET',
		headers: {
		  "ngrok-skip-browser-warning": "69420"
		}
	  });
  
	  const response = await res.json();
  
	  updateState({
		knowledgeContent: response?.summary || 'No knowledge found.',
		isKnowledgeReady: true,
	  });
	} catch (error) {
	  console.error("Error fetching knowledge:", error);
	  updateState({
		isKnowledgeReady: true, 
		knowledgeContent: 'Failed to load knowledge.',
	  });
	}
};

const generateCaseSummary = async ({state, updateState}) => {
	const summaryUrl = `${baseUrl}/api/widget/app.servicenow.webchat.summary?isServicenow=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}`;
	updateState({isSummaryReady: false})
	try {
		const res = await fetch(`${summaryUrl}&incidentId=${state.recordId || '8c82b043835a121036b4a230ceaad3f8'}`, {
			method: 'GET',
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})
		const response = await res.json();
		updateState({
			summaryContent: response?.summary,
			isSummaryReady: true
		})
	}catch(error) {
		console.log("Error fetching Summary:", error);
		updateState({
			isSummaryReady: true,
			summaryContent: 'Failed to load summary.'
		})
		
	}
}


const generateAiAnswer = async ({state, updateState}) => {
	updateState({isAIanswerReady: false})
	const aiAnswerUrl = `${baseUrl}/api/widget/app.servicenow.webchat.aiAnswer?isServicenow=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}`;
	try {
		const res = await fetch(`${aiAnswerUrl}&incidentId=${state.recordId || '8c82b043835a121036b4a230ceaad3f8'}`,{
			method: 'GET',
			headers: {
				"ngrok-skip-browser-warning": "69420"
			}
		})

		const response = await res.json();
		updateState({
			aiAnswer: response?.summary,
			isAIanswerReady: true
		})
	}catch(error)  {
		console.log("Error fetching AIAnswer:", error);
		updateState({
			isAIanswerReady: true,
			aiAnswer: 'Failed to load Ai answer.'
		})
	}
}

  
const generateKnowledgeHandler = (state, updateState) => {
	generateKnowledge({state, updateState});
};

const generateCaseSummaryHandler = (state, updateState) => {
	generateCaseSummary({state, updateState})
}

const generateAiAnswerHandler = (state, updateState) => {
	generateAiAnswer({state, updateState})
}

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
			generateCaseSummaryHandler(state, updateState)
			generateAiAnswerHandler(state, updateState);
			const externalContentUrl = `${baseUrl}/api/hook/webchat.servicenow?isServicenow=true&servicenowDomain=${encodeURIComponent(servicenowDomain)}&incidentId=${incidentId || '8c82b043835a121036b4a230ceaad3f8'}`;

			updateState({
				logoUrl: response?.data?.logoUrl || 'https://app.enjo.ai/enjologo.svg',
				widgetHeading: response?.data?.header || widgetHeading,
				buttonHeading: response?.data?.buttonHeading || buttonHeading,
				showFooter: response?.data?.showEnjoBranding,
				recordId: incidentId,
				chatUrl: externalContentUrl
			})
		},
	}
});
