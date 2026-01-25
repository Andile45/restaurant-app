import {View , StyleSheet,ViewStyle} from 'react-native';
import { colors } from '../theme/colors';
import { Children } from 'react';

interface CardProps{
    children:React.ReactNode;
    style?:ViewStyle;
};

export const Card = ({children,style}:CardProps)=>{

    return(
        <View style={[styles.card,style]}>
            {children}
        </View>
    )
};

const styles = StyleSheet.create({
    card:{
       backgroundColor:colors.background,
       borderRadius:24,
       padding:16,
       position: 'relative',

    // IOS Shadows

    shadowColor:'#000',
    shadowOffset:{width:0 , height:6},
    shadowOpacity:0.08,
    shadowRadius:12,
    
    // Android Shadow
    elevation:6,
    },
});