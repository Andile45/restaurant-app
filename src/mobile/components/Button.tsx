import {Pressable , Text,StyleSheet,View,ViewStyle} from 'react-native'
import { colors } from '../theme/colors'

interface ButtonProps{
    title:string;
    onPress: ()=>void;
    variant?:'primary' | 'secondary';
    style?:ViewStyle
}

export const CustomButton = ({title,onPress,variant='primary',style}:ButtonProps)=>{
   const isPrimary = variant === 'primary';
    return(
        <Pressable
        onPress={onPress}
        style={({pressed})=>[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && {opacity:0.7, transform:[{scale:0.98}]}, style
        ]}
        >
        <Text style={[
            styles.text,
            isPrimary? styles.primaryText : styles.secondaryText
        ]}>
          {title}
        </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button:{
       paddingVertical:16,
       borderRadius:25,
       alignItems:"center",
       justifyContent:'center',
       width:'100%',
       marginVertical:8,
    },
    primaryButton:{
      backgroundColor:colors.primary,
    },
    secondaryButton:{
     backgroundColor:colors.background,
     borderWidth:1,
     borderColor:colors.secondary,
    },
    text:{
      fontWeight:'600',
      fontSize:16,
    },
    primaryText:{
     color:colors.textInverse,
    },
    secondaryText:{
       color:colors.textSecondary,
    }
})