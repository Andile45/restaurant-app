import {TextInput,StyleSheet,ViewStyle} from 'react-native';
import { colors } from '../theme/colors';

interface InputProps{
    placeholder:string;
    value?:string;
    onChangeText?: (text:string)=> void;
    style?:ViewStyle;
};

export const Input =({placeholder,value,onChangeText,style}:InputProps)=>{

    return(
        <TextInput
        style={[styles.input,style]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText} 
        />
    );
};

const styles = StyleSheet.create({
    input:{
      height:52,
      borderRadius:16,
      paddingHorizontal:16,
      borderWidth:1,
      borderColor:colors.border,
      fontSize:16,
      fontFamily:'Inter_400Regular',
      color:colors.textPrimary,
      marginVertical:8,
    },
});