import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import {createHttpEffect} from '@servicenow/ui-effect-http';
import {actionTypes} from '@servicenow/ui-core';

const view = (state, {updateState}) => {
	const {
		activeSection,
		activeSections,
		summaryContent,
		aiAnswer,
		knowledgeContent,
		isIframeVisible,
		isSummaryReady,
		isAIanswerReady,
		isKnowledgeReady,
		activeTab
	} = state;

	return (
		<div className="container">
			<div className="card-container">
				{/* Header Card */}
				<div className="header-card">
					<div className="header-content">
						<div className="logo-section">
							<img src="enjo-logo.png" alt="Enjo Logo" className="logo-class"/>
							<span className="heading">Enjo Assistant</span>
						</div>
						<div className="button-section">
							<button className="btn btn-primary" 
								on-click={() => updateState({isIframeVisible: !isIframeVisible})}>
								Ask Enjo
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
									<iframe src="your-chat-url" className="chat-frame"/>
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
														</div>x
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
																disabled={knowledgeButtonState}>
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
			</div>
		</div>
	);
};

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
		knowledgeButtonState: false
	},
	properties: {
		tableId: {default: ''},
		recordId: {default: ''}
	},
	effects: [
		{
			effect: createHttpEffect('api/now/table/sys_journal_field', {
				method: 'GET',
				queryParams: {
					sysparm_query: 'element_id={{recordId}}^element=comments^ORDERBYDESCsys_created_on',
					sysparm_display_value: true
				}
			}),
			events: [actionTypes.COMPONENT_CONNECTED],
			success: ({action, updateState}) => {
				const conversations = action.payload.result;
				updateState({
					summaryContent: conversations
						.map(conv => `${conv.sys_created_on}: ${conv.value}`)
						.join('\n\n')
				});
			}
		}
	]
});
