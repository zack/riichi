import { Heading, Text } from '@radix-ui/themes';
import { Component, createRef } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { ReportHandLink } from './ReportHandLink';

function HandError({ handFile, handLabel, newHandRef, onNewHand, options }) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby='hand-error-heading'
      className='color-card hand-error jade'
    >
      <div className='hand-error-words' role='alert'>
        <Heading as='h2' id='hand-error-heading' size='4'>
          {handLabel}
        </Heading>
        <Text as='p' size='3'>
          {t('handError.message')}
        </Text>
      </div>
      <button
        className='action-button primary'
        onClick={onNewHand}
        ref={newHandRef}
        type='button'
      >
        {t('buttons.newHand')}
      </button>
      <ReportHandLink handFile={handFile} options={options} />
    </section>
  );
}

class ErrorBoundary extends Component {
  state = { failed: false, resetKey: this.props.resetKey };

  newHandRef = createRef();

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) {
      return { failed: false, resetKey: props.resetKey };
    } else {
      return null;
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    const focusIsLost =
      !document.activeElement || document.activeElement === document.body;

    if (this.state.failed && !prevState.failed && focusIsLost) {
      this.newHandRef.current?.focus();
    }
  }

  render() {
    const { children, handFile, handLabel, onNewHand, options } = this.props;

    if (this.state.failed) {
      return (
        <HandError
          handFile={handFile}
          handLabel={handLabel}
          newHandRef={this.newHandRef}
          onNewHand={onNewHand}
          options={options}
        />
      );
    } else {
      return children;
    }
  }
}

export { ErrorBoundary };
