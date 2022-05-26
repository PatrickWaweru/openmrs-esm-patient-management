import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Row, Tag, Tile } from '@carbon/react';
import { ArrowRight, CircleFill } from '@carbon/react/icons';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { calculateBMI } from '../current-visit.resource';
import { useVitalsConceptMetadata } from '../hooks/useVitalsConceptMetadata';
import { ConfigObject } from '../../config-schema';
import { PatientVitals } from '../../types/index';
import styles from './triage-note.scss';

interface VitalsComponentProps {
  vitals: Array<PatientVitals>;
  patientUuid: string;
}

const Vitals: React.FC<VitalsComponentProps> = ({ vitals, patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const { data: conceptUnits } = useVitalsConceptMetadata();

  const vitalsToDisplay = vitals.reduce(
    (previousVital, currentVital) => Object.assign(previousVital, currentVital),
    {},
  );

  return (
    <div>
      {Object.keys(vitalsToDisplay).length > 0 ? (
        <div>
          <Grid className={styles.grid}>
            <Row>
              <Tile light>
                <p>{t('temperature', 'Temperature')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {vitalsToDisplay.temperature ? vitalsToDisplay.temperature : '--'}
                  </p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.temperatureUuid) ?? ''}</p>
                </div>
              </Tile>
              <Tile light>
                <p>{t('bp', 'Bp')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{vitalsToDisplay.systolic ? vitalsToDisplay.systolic : '--'}</p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}</p>
                </div>
              </Tile>
              <Tile>
                <p>
                  {t('heartRate', 'Heart rate')} <CircleFill className={styles.notification} size={16} />
                </p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{vitalsToDisplay.pulse ? vitalsToDisplay.pulse : '--'}</p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.pulseUuid) ?? ''}</p>
                </div>
              </Tile>
            </Row>

            <Row>
              <Tile light>
                <p>{t('sp02', 'Sp02')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {vitalsToDisplay.oxygenSaturation ? vitalsToDisplay.oxygenSaturation : '--'}
                  </p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}</p>
                </div>
              </Tile>
              <Tile light>
                <p>{t('rRate', 'R. Rate')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {vitalsToDisplay.respiratoryRate ? vitalsToDisplay.respiratoryRate : '--'}
                  </p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}</p>
                </div>
              </Tile>
            </Row>

            <Row>
              <Tile light>
                <p>{t('height', 'Height')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{vitalsToDisplay.height ? vitalsToDisplay.height : '--'}</p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.heightUuid) ?? ''}</p>
                </div>
              </Tile>
              <Tile light>
                <p>{t('bmi', 'Bmi')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {' '}
                    {calculateBMI(Number(vitalsToDisplay.weight), Number(vitalsToDisplay.height))}
                  </p>
                  <p className={styles.unit}>{config.biometrics['bmiUnit']}</p>
                </div>
              </Tile>
              <Tile light>
                <p>{t('weight', 'Weight')}</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{vitalsToDisplay.weight ? vitalsToDisplay.weight : '--'} </p>
                  <p className={styles.unit}>{conceptUnits.get(config.concepts.weightUuid) ?? ''}</p>
                </div>
              </Tile>
            </Row>
          </Grid>
          <p className={styles.subHeading}>
            {vitalsToDisplay.provider?.name ? <span> {vitalsToDisplay.provider.name} </span> : null} ·{' '}
            {vitalsToDisplay.time}
          </p>
        </div>
      ) : (
        <div>
          <p className={styles.emptyText}>
            {t('vitalsNotRecordedForVisit', 'Vitals has not been recorded for this patient for this visit')}
          </p>
          <Button
            size="small"
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={() => navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` })}
            iconDescription={t('vitalsForm', 'Vitals form')}>
            {t('vitalsForm', 'Vitals form')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Vitals;
