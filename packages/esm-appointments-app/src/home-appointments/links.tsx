import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add, Calendar } from '@carbon/react/icons';

import { useConfig, navigate } from '@openmrs/esm-framework';
import PatientSearch from '../patient-search/patient-search.component';
import { launchOverlay } from '../hooks/useOverlay';
import { spaBasePath } from '../constants';

import styles from './appointments-list.scss';

const SeeAllAppointmentsLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Button
      kind="ghost"
      className={styles.seeAllLink}
      size="md"
      target="_blank"
      href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/list`}>
      {t('seeAllAppointments', 'See all appointments')}
    </Button>
  ) : (
    <Button kind="ghost" className={styles.seeAllLink} onClick={() => navigate({ to: `${spaBasePath}` })}>
      {t('seeAllAppointments', 'See all appointments')}
    </Button>
  );
};

const AddAppointmentLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Button
      size="md"
      target="_blank"
      kind="ghost"
      href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar/new`}
      renderIcon={(props) => <Add size={16} {...props} className="cds--btn__icon" />}>
      {t('addNewAppointment', 'Add new appointment')}
    </Button>
  ) : (
    <Button
      kind="ghost"
      renderIcon={(props) => <Add size={16} {...props} />}
      onClick={() => {
        navigate({ to: `${spaBasePath}` });
        launchOverlay(t('search', 'Search'), <PatientSearch />);
      }}>
      {t('addNewAppointment', 'Add new appointment')}
    </Button>
  );
};

const ViewCalendarLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI, bahmniAppointmentsUiBaseUrl } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Button
      kind="ghost"
      size="md"
      target="_blank"
      className="cds--btn cds--btn--ghost"
      href={`${bahmniAppointmentsUiBaseUrl}/#/home/manage/appointments/calendar`}
      renderIcon={(props) => <Calendar size={16} {...props} className="cds--btn__icon" />}>
      {t('viewCalendar', 'View Calendar')}
    </Button>
  ) : (
    <Button
      className={styles.calendarButton}
      kind="ghost"
      onClick={() => navigate({ to: `${spaBasePath}/calendar` })}
      renderIcon={(props) => <Calendar size={16} {...props} />}
      data-floating-menu-primary-focus
      iconDescription={t('viewCalendar', 'View Calendar')}>
      {t('viewCalendar', 'View Calendar')}
    </Button>
  );
};

export { SeeAllAppointmentsLink, AddAppointmentLink, ViewCalendarLink };
