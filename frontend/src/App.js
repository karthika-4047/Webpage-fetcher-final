import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Input, Select, Checkbox, message, Spin } from 'antd';
import * as XLSX from 'xlsx';
import './style.css';

const { Option } = Select;

const App = () => {
  const [url, setUrl] = useState('');
  const [dataType, setDataType] = useState('Extract URLs');
  const [onlyUhf, setOnlyUhf] = useState(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [allDetails, setAllDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // const API_BASE_URL = 'https://webpage-fetcher-backend.vercel.app/api';

  useEffect(() => {
    console.log('Current data:', data);
    console.log('Current allDetails:', allDetails);
  }, [data, allDetails]);

  const extractTagName = (classString) => {
    const classParts = classString.split(' ');
    return classParts[classParts.length - 5]; // Extract the last part of the class string
  };


  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/${dataType}`, {
        url,
        onlyUhf,
      });
      const responseData = response.data;
      console.log('API Response:', responseData);

      //check duplicate meta tags
      // const nameCount = {};
      // responseData.metaTags.forEach((meta) => {
      //   const name = meta.name || meta.property || 'Unknown';
      //   nameCount[name] = (nameCount[name] || 0) + 1;
      // });



      if (dataType === 'extract-urls') {
        setColumns([{ title: 'URL', dataIndex: 'url', key: 'url',
          render: (text) => (
            <a href={text} target="_blank" rel="noopener noreferrer" style={{ color: 'SlateBlue'}}>
              {text}
            </a>
          ),
        }]);
        setData(responseData.urls?.map((url, index) => ({ key: index, url })) || []);
      } else if (dataType === 'link-details') {
        setColumns([
          {
            title: 'Link Type',
            dataIndex: 'linkType',
            key: 'linkType',
            onCell: (record) => ({
              style: {
                fontWeight: 'bold',
                textAlign: 'center',
              },
            }),
          },
          {
            title: 'Link Text',
            dataIndex: 'linkText',
            key: 'linkText',
          },
          { title: 'ARIA Label', dataIndex: 'ariaLabel', key: 'ariaLabel',
           },
          { title: 'URL', dataIndex: 'url', key: 'url',
            render: (text) => (
            <a href={text} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          ), },
          { title: 'Redirected URL', dataIndex: 'redirectedUrl', key: 'redirectedUrl',
            onCell: () => ({
    style: {
      backgroundColor: 'LightYellow',
    },
  }),
            render: (text) => (
            <a href={text} target="_blank" rel="noopener noreferrer" style={{ color: 'SlateBlue'}}>
              {text}
              
            </a>
          ), },
          {
            title: 'Status Code',
            dataIndex: 'statusCode',
            key: 'statusCode',
            align: 'center',
            filters: [
              { text: '200 (Success)', value: 200 },
              { text: '403 (Forbidden)', value: 403 },
              { text: '404 (Not Found)', value: 404 },
              { text: '500 (Internal Server Error)', value: 500 },
              { text: '503 (Service Unavailable)', value: 503 },
            ],
            onFilter: (value, record) => record.statusCode === value,

          
            
            render: (text, record) => (
              <span style={{ color: record.statusColor, fontWeight: 'bold' }}>{text}</span>
            ),
          },
          { title: 'Target', dataIndex: 'target', key: 'target',
            onCell: (record) => ({
              style: {
                fontWeight: 'bold',
                textAlign: 'center',
                color: record.target === '_blank' ? 'orange' : record.target === '_self' ? 'magenta' : 'black', // Conditional coloring
              },
            }),
           },
        ]);
        setData(
          Array.isArray(responseData.links)
            ? responseData.links.map((link, index) => ({ key: index, ...link }))
            : []
        );
      } else if (dataType === 'image-details') {
        setColumns([
          { title: 'Image Name', dataIndex: 'imageName', key: 'imageName' },
          {
            title: 'Alt Text',
            dataIndex: 'alt',
            key: 'alt',
            render: (text, record) => (
              <a href={record.url} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            ),
          },
        ]);
        setData(
          responseData.images?.filter((image) => image.imageName).map((image, index) => ({
            key: index,
            ...image,
          })) || []
        );
      } else if (dataType === 'video-details') {
        setColumns([
          { title: 'Transcript', dataIndex: 'transcript', key: 'transcript' },
          { title: 'CC', dataIndex: 'cc', key: 'cc' },
          { title: 'Autoplay', dataIndex: 'autoplay', key: 'autoplay' },
          { title: 'Muted', dataIndex: 'muted', key: 'muted' },
          { title: 'ARIA Label', dataIndex: 'ariaLabel', key: 'ariaLabel' },
          { title: 'Audio Track Present', dataIndex: 'audioTrack', key: 'audioTrack' },
        ]);
        setData(
          responseData.videoDetails?.map((video, index) => ({
            key: index,
            transcript: video.transcript.join(', '),
            cc: video.cc.join(', '),
            autoplay: video.autoplay,
            muted: video.muted,
            ariaLabel: video.ariaLabel,
            audioTrack: video.audioTrack,
          })) || []
        );
      } else if (dataType === 'page-properties') {
        setColumns([
          { title: 'Name', dataIndex: 'name', key: 'name', 
            onCell: (record) => ({
              style: {
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '16px',
                width: '30%',
                // color: nameCount[record.name] > 1 ? 'red' : 'black', // Set red color if repeated
              },
            }),
            
          },
          { title: 'Content', dataIndex: 'content', key: 'content' },
        ]);
        const metaTagsData = Array.isArray(responseData.metaTags)
          ? responseData.metaTags.map((meta, index) => ({
              key: index,
              name: meta.name || meta.property || 'Unknown',
              content: meta.content || 'N/A',
            }))
          : [];
        console.log('Processed metaTagsData:', metaTagsData);
        setData(metaTagsData);
      // } else if (dataType === 'all-details') {
      //   setAllDetails({
      //     links: responseData.links || [],
      //     images: responseData.images || [],
      //     videoDetails: responseData.videoDetails || [],
      //     pageProperties: Array.isArray(responseData.pageProperties)
      //        ? responseData.pageProperties.map((meta, index) => ({
      //            key: index,
      //            name: meta.name || 'Unknown',
      //            content: meta.content || 'N/A',
      //          }))
      //        : [],
      //     headingHierarchy: responseData.headingHierarchy || [],
      //   });
      } else if (dataType === 'heading-hierarchy') {
        setColumns([
          { title: 'Text', dataIndex: 'text', key: 'text' },
          { title: 'Level', dataIndex: 'level', key: 'level',
            onCell: (record) => ({
              style: {
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '16px'
              },
            }),
           },
          { title: 'Class', dataIndex: 'class', key: 'class' ,
            onCell: (record) => ({
              style: {
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '16px',
                color: 'red'
              },
            }),
          },
        ]);
        setData(
          responseData.headingHierarchy?.map((heading, index) => ({
            key: index,
            level: heading.level,
            text: heading.text,
            // class: heading.class,
            class: extractTagName(heading.class),
          })) || []
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    let sheetData = [];
  
    switch (dataType) {
      case 'extract-urls':
        sheetData = data.map((item) => ({ URL: item.url }));
        break;
      case 'link-details':
        sheetData = data.map((item) => ({
          'Link Type': item.linkType,
          'Link Text': item.linkText,
          'ARIA Label': item.ariaLabel,
          URL: item.url,
          'Redirected URL': item.redirectedUrl,
          'Status Code': item.statusCode,
          Target: item.target,
        }));
        break;
      case 'image-details':
        sheetData = data.map((item) => ({
          'Image Name': item.imageName,
          'Alt Text': item.alt,
        }));
        break;
      case 'video-details':
        sheetData = data.map((item) => ({
          Transcript: item.transcript,
          CC: item.cc,
          Autoplay: item.autoplay,
          Muted: item.muted,
          'ARIA Label': item.ariaLabel,
          'Audio Track Present': item.audioTrack,
        }));
        break;
      case 'page-properties':
        sheetData = data.map((item) => ({
          Name: item.name,
          Content: item.content,
        }));
        break;
      case 'heading-hierarchy':
        sheetData = data.map((item) => ({
          Text: item.text,
          Level: item.level,
          Class: item.class,
        }));
        break;
      default:
        message.warning('No data available to download.');
        return;
    }
  
    if (sheetData.length > 0) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, dataType.replace('-', ' ').toUpperCase());
      XLSX.writeFile(wb, `${dataType.replace('-', '_')}.xlsx`);
    } else {
      message.warning('No data available to download.');
    }
  };
  
  return (
    <div className="container">
      
      <div className="header">
        <h1>Web Page Fetcher</h1>
      </div>
      <Input
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ marginBottom: 10 , width: 600}}
      />
      <br></br>
      <Select
        value={dataType}
        onChange={(value) => {
          setDataType(value);
          setData([]);
          setAllDetails(null); // Clear allDetails when changing dataType
        }}
        style={{ width: 200, marginBottom: 10 }}
      >
        <Option value="extract-urls">Extract URLs</Option>
        <Option value="link-details">Link Details</Option>
        <Option value="image-details">Image Details</Option>
        <Option value="video-details">Video Details</Option>
        <Option value="page-properties">Page Properties</Option>
        <Option value="heading-hierarchy">Heading Hierarchy</Option>
        
      </Select>
      <Checkbox
        checked={onlyUhf}
        onChange={(e) => setOnlyUhf(e.target.checked)}
        style={{ marginBottom: 10,marginLeft: 10 }}
      >
        Only UHF
      </Checkbox>
      <Button
        type="primary"
        onClick={fetchData}
        loading={loading}
        style={{ marginRight: 10 }}
      >
        Fetch Data
      </Button>
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />
      ) : (
        <>
          {dataType !== 'all-details' && data.length > 0 && (
            <Table
            dataSource={data}
            columns={columns.map((col) => ({ ...col, width: 150 }))}
            pagination={false}
            bordered
            style={{ marginTop: 20}}
            scroll={{ x: '100%' }}
            tableLayout="fixed"
            />
          )}
          {dataType === 'all-details' && allDetails && (
            <>
              {allDetails.links.length > 0 && (
                <Table
                  dataSource={allDetails.links}
                  columns={[
                    { title: 'Link Type', dataIndex: 'linkType', key: 'linkType' },
                    {
                      title: 'Link Text',
                      dataIndex: 'linkText',
                      key: 'linkText',
                      render: (text, record) => (
                        <a href={record.url} target="_blank" rel="noopener noreferrer">
                          {text}
                        </a>
                      ),
                    },
                    { title: 'ARIA Label', dataIndex: 'ariaLabel', key: 'ariaLabel' },
                    { title: 'URL', dataIndex: 'url', key: 'url' },
                    { title: 'Redirected URL', dataIndex: 'redirectedUrl', key: 'redirectedUrl' },
                    {
                      title: 'Status Code',
                      dataIndex: 'statusCode',
                      key: 'statusCode',
                      render: (text, record) => (
                        <span style={{ color: record.statusColor }}>{text}</span>
                      ),
                    },
                    { title: 'Target', dataIndex: 'target', key: 'target' },
                  ]}
                  pagination={false}
                  bordered
                  title={() => 'Link Details'}
                  style={{ marginTop: 20 }}
                />
              )}
              {allDetails.images.length > 0 && (
                <Table
                  dataSource={allDetails.images}
                  columns={[
                    { title: 'Image Name', dataIndex: 'imageName', key: 'imageName' },
                    {
                      title: 'Alt Text',
                      dataIndex: 'alt',
                      key: 'alt',
                      render: (text, record) => (
                        <a href={record.url} target="_blank" rel="noopener noreferrer">
                          {text}
                        </a>
                      ),
                    },
                  ]}
                  pagination={false}
                  bordered
                  title={() => 'Image Details'}
                  style={{ marginTop: 20 }}
                />
              )}
              {allDetails.videoDetails.length > 0 && (
                <Table
                  dataSource={allDetails.videoDetails}
                  columns={[
                    { title: 'Transcript', dataIndex: 'transcript', key: 'transcript' },
                    { title: 'CC', dataIndex: 'cc', key: 'cc' },
                    { title: 'Autoplay', dataIndex: 'autoplay', key: 'autoplay' },
                    { title: 'Muted', dataIndex: 'muted', key: 'muted' },
                    { title: 'ARIA Label', dataIndex: 'ariaLabel', key: 'ariaLabel' },
                    { title: 'Audio Track Present', dataIndex: 'audioTrack', key: 'audioTrack' },
                  ]}
                  pagination={false}
                  bordered
                  title={() => 'Video Details'}
                  style={{ marginTop: 20 }}
                />
              )}
              {allDetails.pageProperties.length > 0 && (
                <Table
                  dataSource={allDetails.pageProperties}
                  columns={[
                    { title: 'Name', dataIndex: 'name', key: 'name',
                      
                     },
                    { title: 'Content', dataIndex: 'content', key: 'content' },
                  ]}
                  pagination={false}
                  bordered
                  title={() => 'Page Properties'}
                  style={{ marginTop: 20 }}
                />
              )}
              {allDetails.headingHierarchy.length > 0 && (
                <Table
                  dataSource={allDetails.headingHierarchy}
                  columns={[
                    { title: 'Level', dataIndex: 'level', key: 'level' },
                    { title: 'Text', dataIndex: 'text', key: 'text' },
                  ]}
                  pagination={false}
                  bordered
                  title={() => 'Heading Hierarchy'}
                  style={{ marginTop: 20 }}
                />
              )}
            </>
          )}
          {data.length > 0 || allDetails ? (
            <Button
              type="primary"
              onClick={handleDownloadExcel}
              style={{ marginTop: 20 }}
            >
              Download Excel
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
};

export default App;