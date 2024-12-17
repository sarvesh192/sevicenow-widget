import {createCustomElement} from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, {updateState}) => {
	const {activeSection, summary} = state;

	return (
		<div className="accordion-container">
			<div className="accordion-section">
				<div 
					className="accordion-header"
					on-click={() => updateState({activeSection: activeSection === 'summary' ? '' : 'summary'})}
				>
					<span>Summary</span>
					<span className="accordion-icon">{activeSection === 'summary' ? '−' : '+'}</span>
				</div>
				{activeSection === 'summary' && (
					<div className="accordion-content">
						<p>{summary}</p>
					</div>
				)}
			</div>

			{/* Agent Chat Section */}
			<div className="accordion-section">
				<div 
					className="accordion-header"
					on-click={() => updateState({activeSection: activeSection === 'chat' ? '' : 'chat'})}
				>
					<span>Agent Chat</span>
					<span className="accordion-icon">{activeSection === 'chat' ? '−' : '+'}</span>
				</div>
				{activeSection === 'chat' && (
					<div className="accordion-content">
						<p>Agent chat content goes here...</p>
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
		activeSection: '',
		summary: "this is a test summary"
	}
});
