import {
  ContinueCancelModal,
  label,
  useEnvironment,
} from "@keycloakify/keycloak-account-ui/ui-shared";
import {
  Button,
  DataList,
  DataListContent,
  DataListItem,
  DataListItemRow,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Spinner,
} from "@patternfly/react-core";
import {
  CheckIcon,
  ExternalLinkAltIcon,
  InfoAltIcon,
} from "@patternfly/react-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteConsent, getApplications } from "@keycloakify/keycloak-account-ui/api/methods";
import { ClientRepresentation } from "@keycloakify/keycloak-account-ui/api/representations";
import { Page } from "@keycloakify/keycloak-account-ui/components/page/Page";
import { TFuncKey } from "@keycloakify/keycloak-account-ui/i18n";
import { formatDate } from "@keycloakify/keycloak-account-ui/utils/formatDate";
import { useAccountAlerts } from "@keycloakify/keycloak-account-ui/utils/useAccountAlerts";
import { usePromise } from "@keycloakify/keycloak-account-ui/utils/usePromise";

type Application = ClientRepresentation & {
  open: boolean;
};

export const Applications = () => {
  const { t } = useTranslation();
  const context = useEnvironment();
  const { addAlert, addError } = useAccountAlerts();

  const [applications, setApplications] = useState<Application[]>();
  const [key, setKey] = useState(1);
  const refresh = () => setKey(key + 1);

  usePromise(
    (signal) => getApplications({ signal, context }),
    (clients) => setApplications(clients.map((c) => ({ ...c, open: false }))),
    [key],
  );

  const removeConsent = async (id: string) => {
    try {
      await deleteConsent(context, id);
      refresh();
      addAlert(t("removeConsentSuccess"));
    } catch (error) {
      addError("removeConsentError", error);
    }
  };

  if (!applications) {
    return <Spinner />;
  }

  return (
    <Page title={t("application")} description={t("applicationsIntroMessage")}>
      <DataList id="applications-list" aria-label={t("application")}>
        <DataListItem
          id="applications-list-header"
          aria-labelledby="Columns names"
        >
        </DataListItem>
        {applications.map((application) => (
          <DataListItem
            key={application.clientId}
            aria-labelledby="applications-list"
            data-testid="applications-list-item"
            isExpanded={application.open}
          >
            <DataListItemRow className="pf-v5-u-align-items-center">
	    {application.effectiveUrl && (
	      <Button
		className="pf-v5-u-pl-0 title-case"
		component="a"
		variant="link"
		onClick={() => window.open(application.effectiveUrl)}
	      >
		{label(
		  t,
		  application.clientName || application.clientId,
		)}{" "}
		<ExternalLinkAltIcon />
	      </Button>
	    )}
	    {!application.effectiveUrl && (
	      <>
		{label(
		  t,
		  application.clientName || application.clientId,
		)}
	      </>
	    )}
            </DataListItemRow>

            <DataListContent
              id={`content-${application.clientId}`}
              className="pf-v5-u-pl-4xl"
              aria-label={t("applicationDetails", {
                clientId: application.clientId,
              })}
              isHidden={!application.open}
            >
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t("client")}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {application.clientId}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {application.description && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>
                      {t("description")}
                    </DescriptionListTerm>
                    <DescriptionListDescription>
                      {application.description}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {application.effectiveUrl && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>URL</DescriptionListTerm>
                    <DescriptionListDescription>
                      {application.effectiveUrl.split('"')}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {application.consent && (
                  <>
                    <DescriptionListGroup>
                      <DescriptionListTerm>
                        {t("hasAccessTo")}
                      </DescriptionListTerm>
                      {application.consent.grantedScopes.map((scope) => (
                        <DescriptionListDescription key={`scope${scope.id}`}>
                          <CheckIcon /> {t(scope.name as TFuncKey)}
                        </DescriptionListDescription>
                      ))}
                    </DescriptionListGroup>
                    {application.tosUri && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t("termsOfService")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {application.tosUri}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {application.policyUri && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t("privacyPolicy")}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          {application.policyUri}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    {application.logoUri && (
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t("logo")}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <img src={application.logoUri} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )}
                    <DescriptionListGroup>
                      <DescriptionListTerm>
                        {t("accessGrantedOn")}
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {formatDate(new Date(application.consent.createdDate))}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </>
                )}
              </DescriptionList>
              {(application.consent || application.offlineAccess) && (
                <Grid hasGutter>
                  <hr />
                  <GridItem>
                    <ContinueCancelModal
                      buttonTitle={t("removeAccess")}
                      modalTitle={t("removeAccess")}
                      continueLabel={t("confirm")}
                      cancelLabel={t("cancel")}
                      buttonVariant="secondary"
                      onContinue={() => removeConsent(application.clientId)}
                    >
                      {t("removeModalMessage", { name: application.clientId })}
                    </ContinueCancelModal>
                  </GridItem>
                  <GridItem>
                    <InfoAltIcon /> {t("infoMessage")}
                  </GridItem>
                </Grid>
              )}
            </DataListContent>
          </DataListItem>
        ))}
      </DataList>
    </Page>
  );
};

export default Applications;
