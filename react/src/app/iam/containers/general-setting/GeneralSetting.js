import React, { Component, useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Form, Icon, Input, Modal, Modal as OldModal, Divider } from 'choerodon-ui';
import { message } from 'choerodon-ui/pro';
import { axios, Content, Header, TabPage as Page, Breadcrumb, Permission, Choerodon } from '@choerodon/boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import GeneralSettingContext, { ContextProvider } from './stores';
import './GeneralSetting.less';
import '../../common/ConfirmModal.scss';

import Edit from './components/edit';

const GeneralSetting = observer(() => {
  const { store, AppState, intl: { formatMessage }, intlPrefix, prefixCls, history } = useContext(GeneralSettingContext);
  const [editing, setEditing] = useState(false);
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [isOPERATIONS, setIsOPERATIONS] = useState(false);
  const { id: projectId, name: projectName, organizationId } = AppState.currentMenuType;
  const loadEnableCategory = () => {
    axios.get('/iam/choerodon/v1/system/setting/enable_category')
      .then((response) => {
        setCategoryEnabled(response);
      });
  };

  const loadProject = () => {
    store.axiosGetProjectInfo(projectId).then((data) => {
      store.setImageUrl(data.imageUrl);
      store.setProjectInfo(data);
    }).catch(Choerodon.handleResponseError);
  };

  const loadProjectTypes = () => {
    store.loadProjectTypes().then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        store.setProjectTypes(data);
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    });
  };

  useEffect(() => {
    const pattern = new URLSearchParams(window.location.hash);
    if (pattern.get('category') === 'OPERATIONS') {
      setIsOPERATIONS(true);
    }
    loadEnableCategory();
    loadProject();
    loadProjectTypes();
    return () => {
      store.setProjectInfo({});
      store.setImageUrl(null);
    };
  }, []);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  function handleDisable() {
    const { category } = store.getProjectInfo;
    const content = (
      <div>
        <span>{formatMessage({ id: 'project.info.disable.content' }, { name: projectName })}</span>
        {category === 'PROGRAM' ? (
          <div className="c7n-projects-enable-tips">
            {formatMessage({ id: 'project.info.disable.content.tips' })}
          </div>
        ) : null}
      </div>
    );
    OldModal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: formatMessage({ id: 'project.info.disable.title' }),
      content,
      onOk: async () => {
        try {
          const result = await axios.put(`/iam/choerodon/v1/organizations/${organizationId}/projects/${projectId}/disable`);
          if (result.failed) {
            throw result.message;
          } else {
            message.info('停用成功');
            history.push('/projects');
          }
        } catch (err) {
          message.error(err);
          return false;
        }
      },
    });
  }

  const { enabled, name, code, agileProjectCode, categories = [], creationDate, createUserName } = store.getProjectInfo;
  const imageUrl = store.getImageUrl;
  return (
    <Page
      service={[
        'choerodon.code.project.setting.general-setting.ps.info',
      ]}
    >
      <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>

        <Permission service={['choerodon.code.project.setting.general-setting.ps.update']}>
          <Button
            icon="mode_edit"
            onClick={handleEditClick}
          >
            <FormattedMessage id="modify" />
          </Button>
        </Permission>
        <Permission service={['choerodon.code.project.setting.general-setting.ps.disable']}>
          <Button
            icon="remove_circle_outline"
            onClick={handleDisable}
          >
            <FormattedMessage id="disable" />
          </Button>
        </Permission>
      </Header>
      <Breadcrumb />
      <Content style={{ paddingTop: 0 }}>
        <div className={prefixCls}>
          <div style={{ display: 'flex' }}>
            <section className={`${prefixCls}-section`}>
              <div className={`${prefixCls}-section-content`}>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.name` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    {name}
                  </div>
                </div>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.code` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    {code}
                  </div>
                </div>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.category` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    {(categories || []).map(c => c.name).join(',')}
                  </div>
                </div>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.creationDate` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    {creationDate}
                  </div>
                </div>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.creator` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    {createUserName}
                  </div>
                </div>
              </div>
            </section>
            <section className={`${prefixCls}-section`} style={{ marginLeft: 100 }}>
              <div className={`${prefixCls}-section-content`}>
                <div className={`${prefixCls}-section-item`}>
                  <div className={`${prefixCls}-section-item-title`}>
                    {formatMessage({ id: `${intlPrefix}.avatar` })}
                  </div>
                  <div className={`${prefixCls}-section-item-content`}>
                    <div className="c7n-iam-generalsetting-avatar">
                      <div
                        className="c7n-iam-generalsetting-avatar-wrap"
                        style={{
                          backgroundColor: '#c5cbe8',
                          backgroundImage: imageUrl ? `url('${Choerodon.fileServer(imageUrl)}')` : '',
                        }}
                      >
                        {!imageUrl && name && name.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {
            !isOPERATIONS && (
              <React.Fragment>
                <Divider />
                <section className={`${prefixCls}-section`}>
                  <div className={`${prefixCls}-section-title`}>
                    {formatMessage({ id: `${intlPrefix}.otherSetting` })}
                  </div>
                  <div className={`${prefixCls}-section-content`}>
                    <div className={`${prefixCls}-section-item`}>
                      <div className={`${prefixCls}-section-item-title`}>
                        {formatMessage({ id: `${intlPrefix}.agile.prefix` })}
                      </div>
                      <div className={`${prefixCls}-section-item-content`}>
                        {agileProjectCode}
                      </div>
                    </div>
                  </div>
                </section>
              </React.Fragment>
            )
          }
        </div>
        <Edit
          visible={editing}
          onCancel={handleCancel}
          categoryEnabled={categoryEnabled}
        />
      </Content>
    </Page>
  );
});


export default function Index(props) {
  return (
    <ContextProvider {...props}>
      <GeneralSetting />
    </ContextProvider>
  );
}
