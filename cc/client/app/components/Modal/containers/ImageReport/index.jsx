import React from 'react';

import Panel from '../../../../component/base/panel';

import cc from '../../../../cc';

import { CCContextConsumer } from '../../../../containers/Application';

import { format as formatDatefns } from "date-fns"

import './style.scss';

const columns = ['User', 'Model', 'Timestamp', 'Type', 'Image ID'];

const formatDate = (d, f) => {
  return formatDatefns(d, f ? f : 'MM-dd-yyyy H:mm:ss');
};

const getZipReport = async (
  model,
  from,
  to,
  filename = 'report',
  prepareCbk = () => {},
) => {
  try {
    const queryString = `from=${encodeURIComponent(
      from,
    )}&to=${encodeURIComponent(to)}&tz=${encodeURIComponent(
      new Date().getTimezoneOffset(),
    )}`;
    const response = await cc.request.get(
      `/api/module/${model}/image-report/zip?${queryString}`,
    );
    if (response.status === 200) {
      // response was the report ZIP
      prepareCbk(); // callback for when the ZIP data has been prepared and received from the server
      const a = document.createElement('a');
      a.href = 'data:application/zip;base64,' + response.data;
      a.download = `${filename}.zip`;
      a.click();
    } else {
      if ('data' in response.data) {
        prepareCbk(response.data.data);
      } else {
        prepareCbk('An error occurred.');
      }
    }
  } catch (err) {
    prepareCbk(err.message);
  }
};

class ImageReport extends React.Component {
  UNSAFE_componentWillMount() {
    this.setState({
      loading: true,
      error: null,
      data: [],
      preparing: false,
    });

    const timezone = new Date().getTimezoneOffset();

    cc.request
      .post(`/api/module/${this.props.model}/image-report`, {
        from: formatDate(this.props.from, 'MM-dd-yyyy'),
        to: formatDate(this.props.to, 'MM-dd-yyyy'),
        tz: timezone,
      })
      .then(results => {
        this.setState(
          {
            loading: false,
            data: results.data.data,
          },
          () => {
            if (this.state.data.length > 0) {
              this.setState({
                selected: this.state.data[0].imageId,
              });
            }
          },
        );
      })
      .catch(err => {
        const error =
          err.response.data.error.errors.length > 0
            ? err.response.data.error.errors[0].message
            : err.response.data.error.message;
        this.setState({
          loading: false,
          error,
        });
      });
  }

  render() {
    const openWindow = (url, title, cbk) => {
      const w = window.open(url, '_blank');
      w.onload = () => {
        w.document.title = title;
        cbk && cbk(w);
      };
    };
    const expandEntry = entry => {
      if (entry === null) return;

      const url = `/api/module/images/${entry.imageId}`;
      const title = `${entry.user.firstname}'s Capture #${entry.imageId}`;
      const cbk = w => {
        w.document.body.style['background-color'] = 'white';
      };

      openWindow(url, title, cbk);
    };

    const getEntryById = id => {
      let ret = null;
      this.state.data.some(entry => {
        if (entry.iamgeId === id) {
          ret = entry;
          return true;
        } else return false;
      });
      return ret;
    };

    return this.state.error !== null ? (
      <div className="image-report error">{this.state.error}</div>
    ) : (
      <CCContextConsumer>
        {({ model }) => {
          return (
            <React.Fragment>
              <Panel
                parentWidth={750}
                parentHeight={580}
                height={200}
                top="0"
                left="0"
                className="image-report-table">
                <div className="text-center">
                  {this.state.loading ? (
                    <div className="loading"></div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          {columns.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.data.map(entry => {
                          const style = {
                            'user-select': 'none',
                            cursor: 'pointer',
                          };
                          if (this.state.selected === entry.imageId) {
                            style['background-color'] = '#d0eaf1';
                          }

                          const name =
                            entry.user.lastname !== null
                              ? `${entry.user.lastname}, ${entry.user.firstname}`
                              : entry.user.firstname;

                          const onClick = () => {
                            if (this.state.selected === entry.imageId) {
                              expandEntry(entry);
                            } else {
                              this.setState({ selected: entry.imageId });
                            }
                          };

                          return (
                            <tr
                              key={entry.user.id}
                              style={style}
                              onClick={onClick}>
                              <td
                                title={
                                  entry.user.id !== -1
                                    ? `User ID #${entry.user.id}`
                                    : '[user deleted]'
                                }>
                                {name}
                              </td>
                              <td>{entry.model}</td>
                              <td>{formatDate(new Date(entry.timestamp))}</td>
                              <td>
                                {entry.type === 'MODEL'
                                  ? 'Model Capture'
                                  : 'Simulation Capture'}
                              </td>
                              <td>{entry.imageId}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Panel>
              <Panel
                parentWidth={800}
                parentHeight={700}
                height={350}
                left={0}
                top={200}>
                <div className="text-center">
                  {this.state.selected ? (
                    <img
                      src={`/api/module/images/${this.state.selected}`}
                      height={300}
                      className="image-report-preview"
                      onClick={() => {
                        expandEntry(getEntryById(this.state.selected));
                      }}
                    />
                  ) : null}
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    this.setState({ preparing: true });
                    getZipReport(
                      model.top.id,
                      formatDate(this.props.from, 'MM-dd-yyyy'),
                      formatDate(this.props.to, 'MM-dd-yyyy'),
                      `${model.top.name}_${model.top.id}_${formatDate(
                        this.props.from, 'MM-dd-yyyy')}_${formatDate(this.props.to, 'MM-dd-yyyy')}`,
                      () => {
                        this.setState({ preparing: false });
                      },
                    );
                  }}>
                  <input
                    type="submit"
                    value={
                      this.state.preparing
                        ? 'Downloading...'
                        : 'Download Full Report'
                    }
                    disabled={this.state.preparing}
                  />
                </form>
              </Panel>
            </React.Fragment>
          );
        }}
      </CCContextConsumer>
    );
  }
}

export default ImageReport;
