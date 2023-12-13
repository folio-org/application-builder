import css from './SearchSelector.module.css';
import {Input, Radio, Select} from 'antd';
import * as Constants from '../../utils/constants';
import {useState} from "react";

const contentTypes = [Constants.APPLICATION_TYPE, Constants.MODULE_TYPE, Constants.UI_TYPE];

function SearchSelector({
  onContentTypeChange, searchOptions,
  searchOption, onSearchOptionChange,
  searchText, onSearchTextChange
}) {
  const [currContentType, setCurrentContentType] = useState(contentTypes[0]);
  const setContentType = ({target: {value}}) => {
    onContentTypeChange(value);
    setCurrentContentType(value);
  };

  return (
    <>
      <Radio.Group value={currContentType}
                   size='small'
                   className={css.radioButtonGroup}
                   onChange={setContentType}
                   optionType='button'
                   buttonStyle='solid'
                   options={contentTypes}/>
      <Select optionFilterProp='children'
              disabled={true}
              size={'small'}
              defaultValue={searchOption}
              onChange={onSearchOptionChange}
              options={searchOptions.map((option) => ({value: option, label: option}))}
              className={css.searchOptionsDropdown}/>
      <Input size='small' onChange={onSearchTextChange}
             rootClassName={css.searchTextInput}
             disabled={true}>
        {searchText}
      </Input>
    </>
  );
};

export default SearchSelector;
